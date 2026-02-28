import yahooFinance from 'yahoo-finance2';

async function test() {
  try {
    const result = await yahooFinance.search('AAPL');
    console.log("Quotes count:", result.quotes.length);
    console.log("News count:", result.news.length);
    if(result.news.length > 0) {
      console.log('Sample news date:', new Date(result.news[0].providerPublishTime * 1000).toISOString());
    }
  } catch (error) {
    console.error(error);
  }
}
test();
