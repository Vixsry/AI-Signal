class CryptoStream {
    constructor() {
        this.connect();
        this.prices = new Map();
        this.positions = new Map();
        this.signals = [];
    }

    connect() {
        this.ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');
        
        this.ws.onopen = () => {
            console.log('Connected to exchange');
            $('#connection-status i').removeClass('text-danger').addClass('text-success');
        };

        this.ws.onclose = () => {
            console.log('Disconnected from exchange');
            $('#connection-status i').removeClass('text-success').addClass('text-danger');
            setTimeout(() => this.connect(), 5000);
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.processTickerData(data);
        };
    }

    processTickerData(data) {
        data.forEach(ticker => {
            if (ticker.s.endsWith('USDT')) {
                const price = parseFloat(ticker.c);
                const change = parseFloat(ticker.P);
                const symbol = ticker.s;

                if (this.prices.has(symbol)) {
                    this.updateTicker(symbol, price, change);
                } else {
                    this.addTicker(symbol, price, change);
                }

                this.prices.set(symbol, price);
                this.updatePositions(symbol, price);
                this.fetchAIAnalysis(symbol, price);
            }
        });
    }

    addTicker(symbol, price, change) {
        const template = document.getElementById('price-ticker-template');
        const clone = document.importNode(template.content, true);

        clone.querySelector('.symbol').textContent = symbol;
        clone.querySelector('.price').textContent = `$${price.toFixed(2)}`;
        clone.querySelector('.change').textContent = `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;

        const priceContainer = document.getElementById('price-tickers');
        priceContainer.appendChild(clone);
    }

    updateTicker(symbol, price, change) {
        const tickerElements = document.querySelectorAll(`#price-tickers .col-md-3`);
        tickerElements.forEach((el) => {
            const symbolEl = el.querySelector('.symbol');
            if (symbolEl.textContent === symbol) {
                el.querySelector('.price').textContent = `$${price.toFixed(2)}`;
                el.querySelector('.change').textContent = `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
                if (change > 0) {
                    el.querySelector('.change').classList.add('trend-up');
                    el.querySelector('.change').classList.remove('trend-down');
                } else {
                    el.querySelector('.change').classList.add('trend-down');
                    el.querySelector('.change').classList.remove('trend-up');
                }
            }
        });
    }

    updatePositions(symbol, price) {
        if (this.positions.has(symbol)) {
            const position = this.positions.get(symbol);
            position.currentPrice = price;
            this.updatePositionCard(symbol, position);
        }
    }

    updatePositionCard(symbol, position) {
        const positionElement = document.querySelector(`#active-positions .position-card[data-symbol="${symbol}"]`);
        if (positionElement) {
            positionElement.querySelector('.current-price').textContent = `$${position.currentPrice.toFixed(2)}`;
            positionElement.querySelector('.pnl').textContent = this.calculatePnL(position.entryPrice, position.currentPrice);
            positionElement.querySelector('.duration').textContent = position.duration;
        }
    }

    addNewPosition(symbol, entryPrice) {
        const position = {
            entryPrice: entryPrice,
            currentPrice: entryPrice,
            duration: '0s'
        };
        this.positions.set(symbol, position);
        const template = document.getElementById('position-card-template');
        const clone = document.importNode(template.content, true);

        clone.querySelector('.symbol').textContent = symbol;
        clone.querySelector('.entry-price').textContent = `$${entryPrice.toFixed(2)}`;
        clone.querySelector('.current-price').textContent = `$${entryPrice.toFixed(2)}`;
        clone.querySelector('.pnl').textContent = '0.00';
        clone.querySelector('.duration').textContent = '0s';

        clone.querySelector('.position-card').setAttribute('data-symbol', symbol);

        const activePositionsContainer = document.getElementById('active-positions');
        activePositionsContainer.appendChild(clone);
    }

    calculatePnL(entryPrice, currentPrice) {
        const pnl = ((currentPrice - entryPrice) / entryPrice) * 100;
        return `${pnl.toFixed(2)}%`;
    }

    fetchAIAnalysis(symbol, price) {
        const sentiment = Math.random() * 100;
        const volatility = Math.random() * 100;
        const volume = Math.random() * 100;

        document.getElementById('sentiment-bar').style.width = `${sentiment}%`;
        document.getElementById('sentiment-bar').textContent = `Sentiment: ${sentiment.toFixed(2)}%`;

        document.getElementById('volatility-bar').style.width = `${volatility}%`;
        document.getElementById('volatility-bar').textContent = `Volatility: ${volatility.toFixed(2)}%`;

        document.getElementById('volume-bar').style.width = `${volume}%`;
        document.getElementById('volume-bar').textContent = `Volume: ${volume.toFixed(2)}%`;

        document.getElementById('last-update').textContent = `Last Update: ${new Date().toLocaleTimeString()}`;
    }

    // Function to add new signal to the latest AI analysis section
    addNewSignal(symbol, price) {
        const signal = {
            symbol: symbol,
            price: price,
            sentiment: Math.random() * 100,
            volatility: Math.random() * 100,
            volume: Math.random() * 100
        };
        this.signals.push(signal);
        this.renderSignalCard(signal);
    }

    renderSignalCard(signal) {
        const template = `
            <div class="col-md-4 signal-card">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title">${signal.symbol}</h6>
                        <p class="card-text">
                            <strong>Price:</strong> $${signal.price.toFixed(2)} <br>
                            <strong>Sentiment:</strong> ${signal.sentiment.toFixed(2)}% <br>
                            <strong>Volatility:</strong> ${signal.volatility.toFixed(2)}% <br>
                            <strong>Volume:</strong> ${signal.volume.toFixed(2)}% 
                        </p>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('signal-container').innerHTML += template;
    }
}

// Instantiate CryptoStream
const cryptoStream = new CryptoStream();

// Simulate adding a new position after 2 seconds
setTimeout(() => {
    cryptoStream.addNewPosition('BTCUSDT', 21000);
}, 2000);

// Simulate processing ticker data after 3 seconds
setTimeout(() => {
    cryptoStream.processTickerData([
        { s: 'BTCUSDT', c: '21050', P: '0.15' },
        { s: 'ETHUSDT', c: '1600', P: '-0.25' },
        { s: 'BNBUSDT', c: '300', P: '1.05' }
    ]);
}, 3000);

// Simulate adding a new AI signal after 4 seconds
setTimeout(() => {
    cryptoStream.addNewSignal('BTCUSDT', 21050);
    cryptoStream.addNewSignal('ETHUSDT', 1600);
}, 4000);




const priceContainer = document.getElementById('price-container');
const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'DOGEUSDT'];
let ws;

function connectWebSocket() {
    ws = new WebSocket('wss://stream.binance.com:9443/ws');

    ws.onopen = function() {
        const subscribeMsg = {
            method: "SUBSCRIBE",
            params: symbols.map(symbol => symbol.toLowerCase() + "@ticker"),
            id: 1
        };
        ws.send(JSON.stringify(subscribeMsg));
    };

    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.s && data.p) {
            updatePrice(data);
        }
    };

    ws.onerror = function(error) {
        console.error('WebSocket error:', error);
    };

    ws.onclose = function() {
        console.log('WebSocket connection closed. Reconnecting...');
        setTimeout(connectWebSocket, 5000);
    };
}

function updatePrice(data) {
    const symbol = data.s;
    const price = parseFloat(data.c).toFixed(2);
    const priceChange = parseFloat(data.p).toFixed(2);
    const priceChangePercent = parseFloat(data.P).toFixed(2);
    
    let elementId = `price-${symbol}`;
    let element = document.getElementById(elementId);
    
    if (!element) {
        element = document.createElement('div');
        element.id = elementId;
        element.className = 'card p-3 mb-3 text-white';
        priceContainer.appendChild(element);
    }

    const iconClass = getCryptoIcon(symbol);
    const priceClass = priceChangePercent >= 0 ? 'price-up' : 'price-down';
    
    element.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <i class="${iconClass} me-2"></i>
                <span>${symbol}</span>
            </div>
            <div class="${priceClass}">
                $${price}
                <small class="ms-2">${priceChangePercent}%</small>
            </div>
        </div>
    `;
}

function getCryptoIcon(symbol) {
    const icons = {
        'BTCUSDT': 'fab fa-bitcoin',
        'ETHUSDT': 'fab fa-ethereum',
        'BNBUSDT': 'fas fa-coins',
        'DOGEUSDT': 'fas fa-dog'
    };
    return icons[symbol] || 'fas fa-coins';
}

// Start WebSocket connection
connectWebSocket();
