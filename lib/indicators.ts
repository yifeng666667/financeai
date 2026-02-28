export interface Point {
    time: string;
    value: number;
}

export interface OHLCV {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

// Simple Moving Average (SMA)
export function calculateSMA(data: OHLCV[], period: number): Point[] {
    const result: Point[] = [];
    for (let i = period - 1; i < data.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j].close;
        }
        result.push({
            time: data[i].time,
            value: sum / period,
        });
    }
    return result;
}

// Exponential Moving Average (EMA) - helper for MACD
export function calculateEMA(data: number[], period: number): number[] {
    const k = 2 / (period + 1);
    const emaArray: number[] = [];
    
    // SMA for first value
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += data[i];
    }
    let ema = sum / period;
    
    // Pad initial EMA undefined values with NaN, but we'll drop them later anyway
    for(let i=0; i < period -1; i++){
        emaArray.push(NaN); 
    }
    emaArray.push(ema);

    for (let i = period; i < data.length; i++) {
        ema = (data[i] - ema) * k + ema;
        emaArray.push(ema);
    }
    
    return emaArray;
}

// MACD (Moving Average Convergence Divergence)
export function calculateMACD(data: OHLCV[], fastLength: number = 12, slowLength: number = 26, signalLength: number = 9) {
    const closes = data.map(d => d.close);
    const fastEma = calculateEMA(closes, fastLength);
    const slowEma = calculateEMA(closes, slowLength);
    
    const macdLineArr: number[] = [];
    for (let i = 0; i < closes.length; i++) {
        if (isNaN(fastEma[i]) || isNaN(slowEma[i])) {
            macdLineArr.push(NaN);
        } else {
            macdLineArr.push(fastEma[i] - slowEma[i]);
        }
    }
    
    // Calculate signal line which is EMA of MACD Line
    // Find first valid MACD index
    let startIdx = 0;
    while(isNaN(macdLineArr[startIdx]) && startIdx < macdLineArr.length) {
        startIdx++;
    }
    
    const validMacdLine = macdLineArr.slice(startIdx);
    const signalLineRaw = calculateEMA(validMacdLine, signalLength);
    
    // Pad signalLine with NaNs to align with original array
    const signalLineArr = Array(startIdx).fill(NaN).concat(signalLineRaw);
    
    const histogramArr: number[] = [];
    for (let i = 0; i < closes.length; i++) {
        if (isNaN(macdLineArr[i]) || isNaN(signalLineArr[i])) {
            histogramArr.push(NaN);
        } else {
            histogramArr.push(macdLineArr[i] - signalLineArr[i]);
        }
    }
    
    const result = [];
    for (let i = 0; i < data.length; i++) {
        if (!isNaN(macdLineArr[i]) && !isNaN(signalLineArr[i]) && !isNaN(histogramArr[i])) {
            result.push({
                time: data[i].time,
                macd: macdLineArr[i],
                signal: signalLineArr[i],
                histogram: histogramArr[i]
            });
        }
    }
    return result;
}

// Relative Strength Index (RSI)
export function calculateRSI(data: OHLCV[], period: number = 14): Point[] {
    const result: Point[] = [];
    const closes = data.map(d => d.close);
    
    if (closes.length < period + 1) return result;

    let gain = 0;
    let loss = 0;

    // First RSI requires SMA of gains/losses
    for (let i = 1; i <= period; i++) {
        const change = closes[i] - closes[i - 1];
        if (change > 0) gain += change;
        else loss -= change;
    }

    let avgGain = gain / period;
    let avgLoss = loss / period;

    let rs = avgGain / avgLoss;
    let rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));

    result.push({ time: data[period].time, value: rsi });

    // Smoothed subsequent RSI
    for (let i = period + 1; i < closes.length; i++) {
        const change = closes[i] - closes[i - 1];
        let currentGain = 0;
        let currentLoss = 0;

        if (change > 0) currentGain = change;
        else currentLoss = Math.abs(change);

        avgGain = (avgGain * (period - 1) + currentGain) / period;
        avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

        rs = avgGain / avgLoss;
        rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));

        result.push({ time: data[i].time, value: rsi });
    }

    return result;
}
