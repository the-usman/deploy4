const mongoose = require('mongoose');

const ConnectToDataBase = async () => {
    try {
        const db = process.env.DB; 
        let retryCount = 0;
        const maxRetries = 5;
        
        const connectWithRetry = async () => {
            await mongoose.connect(db, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
        };

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(async () => {
                    console.log(`Retrying connection... Attempt ${retryCount}`);
                    await connectWithRetry();
                }, 10000); 
            } else {
                console.error('Failed to connect to MongoDB after several attempts.');
            }
        });

        await connectWithRetry();
        console.log('Successfully Connected To MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

module.exports = ConnectToDataBase;
