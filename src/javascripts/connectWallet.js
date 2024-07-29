const ethers = require('ethers');
// const abi = require('../../artifacts/contracts/ShippingReceiving.sol/Shipping.json');
console.log("ethers: ", ethers);

// Connect Wallet
const connectBtn = document.getElementById('connect-btn');
const addressValue = document.getElementById('address-value')
const isConnectedValue = document.getElementById('is-connected-value');

// Add Cargo
const submitCargoBtn = document.getElementById('submit-cargo');
const senderValue = document.getElementById('sender-value');
const receiverValue = document.getElementById('receiver-value');
const currentLocValue = document.getElementById('current-location-value');
const materialValue = document.getElementById('material-value');
const quantityValue = document.getElementById('quantity-value');
const costValue = document.getElementById('cost-value');
const instructValue = document.getElementById('special-instructions-value');
const finalLocValue = document.getElementById('final-location-value');

// Local Storage
let cargoArr = [];

// Ship Cargo
const bolCreationResult = document.getElementById('billoflanding-result');
const shipBolInput = document.getElementById('ship-bol');
const shipCargoBtn = document.getElementById('shipCargo-btn');

// Update Location
const updateSearchBtn = document.getElementById('update-search');
const updateLocBtn = document.getElementById('update-btn');
const updateBol = document.getElementById('update-bol');
const updateWallet = document.getElementById('update-wallet');
const updateSearchResult = document.getElementById('updateCargo-search');
const updateNewLoc = document.getElementById('new-location');
const updateReason = document.getElementById('update-reason');

// Shipping History
const bolHistoryInput = document.getElementById('bol-history');
const bolHistorybtn = document.getElementById('bolhistory-search');
const bolHistoryResult = document.getElementById('datatable-result');

// Accept Cargo
const acceptBolInput = document.getElementById('accept-bol');
const acceptWalletInput = document.getElementById('accept-wallet');
const acceptSearchBtn = document.getElementById('accept-search');
const searchResult = document.getElementById('accept-bol-result');
const getCargoBtn = document.getElementById('getCargo-btn');

// Shipping
const status = {pending: 'Pending', 
				shipping: 'Shipping',
				accepted: 'Accepted',
				rejected: 'Rejected',
				cancelled: 'Cancelled'
			};
const authorization = {receiver: 'receiver', sender:'sender'};

let isConnected;
let provider;
let signer;

// Your contract setup can go here
// Mode network 
const contractAddress = '0x1e173eB30E9d9B89756F1A6B0ECCb4cD9E36f667';
const contractAddressTest = '0xD59ecF1207b792FFd181795aD44090Df4cea3b78';
const abi = [];
const providerContract = new ethers.Contract(contractAddressTest, abi, provider);
const signerContract = new ethers.Contract(contractAddressTest, abi, signer);

connectBtn.addEventListener('click', async () => {
	localStorage.clear();
    if (typeof window.ethereum !== 'null') {
        try {
            isConnectedValue.innerText = 'Loading...';
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Create a new Web3 provider
            provider = new ethers.BrowserProvider(window.ethereum);
            console.log("provider: ", provider);
			
            signer = await provider.getSigner();
            
            // Get the connected account address
            const address = await signer.getAddress();
            
            addressValue.innerText = `${address.slice(0, 6)}...${address.slice(-4)}`;
            isConnectedValue.innerText = 'Connected';
            isConnected = true;
        } catch (error) {
            console.error(error);
            isConnectedValue.innerText = `Error occurred: ${error.message}`;
            isConnected = false;
        }
    } else {
        alert('MetaMask is not installed. Please install it to use this app.');
    }
})

function checkWallet() {
    if (!isConnected) {
      alert('Connect to the wallet')
      return
    }
}

function randomInt(number){
	return Math.floor(Math.random()*(number))
}  


document.addEventListener('DOMContentLoaded', function() {
	submitCargoBtn.addEventListener('click', async() => {
		checkWallet();
	
		if(isConnected){
			try {
				let cargoCreation = {
					cargoId: randomInt(10000), 
					sender: senderValue.value,
					receiver: receiverValue.value,
					currentLocation: currentLocValue.value,
					material: materialValue.value,
					quantity: quantityValue.value,
					cost: costValue.value,
					instructions: instructValue.value,
					finalDestination: finalLocValue.value,
					status: status.pending,
					authorization: authorization.sender
				}
				console.log("cargo created: ", cargoCreation)
	
				cargoArr.push(cargoCreation);
	
				let jsonArr = JSON.stringify(cargoArr);
				localStorage.setItem("currentBoLs", jsonArr);
	
				let retrievedBoLs = localStorage.getItem('currentBoLs');
				let parsingBoLs = JSON.parse(retrievedBoLs);
				console.log("parsingBoLs: ", parsingBoLs);

				senderValue.value = "";
				receiverValue.value = "";
				currentLocValue.value = "";
				materialValue.value = "";
				quantityValue.value = "";
				costValue.value = "";
				instructValue.value = "";
				finalLocValue.value = "";
	
				showBoLCreationResult(parsingBoLs);
	
			} catch(error){
				console.log("error creating bol: ", error)
			}
		}    
	})
	
	function showBoLCreationResult(parsingBoLs) {
		console.log("display BoLs: ", parsingBoLs);
		bolCreationResult.innerHTML = "";
	
		parsingBoLs.forEach(bol => {
			if(bol.status === "Pending") {
				bolCreationResult.innerHTML += `
					<div class="bol-layout">
						<h4>Bill of Landing ID #${bol.cargoId}</h4>
						<h5 style="color: red;">Status: ${bol.status}</h5>
						<h5>Details</h5>
						<ul>
							<li>Sender: ${bol.sender.slice(0,6)}...${bol.sender.slice(-4)}</li>
							<li>Receiver: ${bol.receiver.slice(0,6)}...${bol.receiver.slice(-4)}</li>
							<span id="points">...</span>
							<span id="more-bol-details">
								<li>From: ${bol.currentLocation}</li>
								<li>To: ${bol.finalDestination}</li>
								<li>Material: ${bol.quantity} ${bol.material}</li>
								<li>Cost: ${bol.cost}</li>
								<li>Instructions: ${bol.instructions}</li>
							</span>
							<a>Show more</a>
						</ul>
					</div>
				`
			}
		});
	}
	
	shipCargoBtn.addEventListener('click', async() => {
		let retrievedBoLs = localStorage.getItem('currentBoLs');
		let parsingBoLs = JSON.parse(retrievedBoLs);
		console.log("shipBolInput: ", shipBolInput.value);

		if(parsingBoLs){
			let updated = false;
			parsingBoLs.forEach(bol => {
				if(bol.cargoId === parseInt(shipBolInput.value) && bol.status === status.pending){
					console.log("bol found: ", bol)
					bol.status = status.shipping;
					updated = true;
				} else {
					console.log("bol not found")
				}
			});
			console.log("updated parsingBoLs: ", parsingBoLs);

			if(updated){
				let tempCargoArr = JSON.stringify(parsingBoLs);
				localStorage.setItem('currentBoLs', tempCargoArr);
				console.log("tempCargoArr: ", tempCargoArr);
				alert(`Bill of Landing #${shipBolInput.value} status is updated to 'Shipping'`);
				shipBolInput.value = "";
				showBoLCreationResult(parsingBoLs);
			} else {
				alert(`Bill of Landing ${shipBolInput.value} not found or already shipped`);
			}	
		}
		
	});

	bolHistorybtn.addEventListener('click', async() => {
		let retrievedBoLs = localStorage.getItem('currentBoLs');
		let parsingBoLs = JSON.parse(retrievedBoLs);
		console.log("shipBolInput: ", bolHistoryInput.value);

		if(parsingBoLs){
			parsingBoLs.forEach(bol => {
				if(bol.cargoId === parseInt(bolHistoryInput.value)){
					console.log("bol found: ", bol);
					bolHistoryResult.innerHTML += `
						<div class="datatable-layout" style="overflow-x: auto">
							<table style="border: 1px solid black; text-align: center;">
								<tr>
									<th>BoL #</th>
									<th>Status</th>
									<th>Sender</th>
									<th>Receiver</th>
									<th>Current Location</th>
									<th>Destination</th>
									<th>Material</th>
									<th>Quantity</th>
									<th>Cost</th>
									<th>Instructions</th>
								</tr>
								
								<tr>
									<td>${bol.cargoId}</td>
									<td>${bol.status}</td>
									<td>${bol.sender.slice(0,6)}...${bol.sender.slice(-4)}</td>
									<td>${bol.receiver.slice(0,6)}...${bol.receiver.slice(-4)}</td>
									<td>${bol.currentLocation}</td>
									<td>${bol.finalDestination}</td>
									<td>${bol.material}</td>
									<td>${bol.quantity}</td>
									<td>${bol.cost}</td>
									<td>${bol.instructions}</td>
								</tr>
							</table>
							
						</div>
					`;
				} else {
					alert(`BoL ID#${bolHistoryInput.value} not found`);
				}
			})
		}
	});

	// Update Location
	updateSearchBtn.addEventListener('click', async() => {
		updateSearchResult.innerHTML = ``;
		let retrievedBoLs = localStorage.getItem('currentBoLs');
		let parsingBoLs = JSON.parse(retrievedBoLs);
		console.log("updateBol: ", updateBol.value, "updateWallet: ", updateWallet.value);

		if(parsingBoLs){
			parsingBoLs.forEach(bol => {
				if(bol.cargoId === parseInt(updateBol.value) && bol.sender.toString() === updateWallet.value.toString() && bol.status === status.shipping){
					console.log("bol found: ", bol);
					updateSearchResult.innerHTML = `
						<div style="background-color: cornsilk; border: 1px solid black; width: 100%; padding: 10px;">
							<h4>Bill of Landing ID #${bol.cargoId}</h4>
							<h5 style="color: red;">Status: ${bol.status}</h5>
							<h5>Details</h5>
							<ul style="list-style-type: none; list-style: none; padding: 0;">
								<li>Sender: ${bol.sender.slice(0,6)}...${bol.sender.slice(-4)}</li>
								<li>Receiver: ${bol.receiver.slice(0,6)}...${bol.receiver.slice(-4)}</li>
								<span id="points">...</span>
								<span id="more-bol-details">
									<li>From: ${bol.currentLocation}</li>
									<li>To: ${bol.finalDestination}</li>
									<li>Material: ${bol.quantity} ${bol.material}</li>
									<li>Cost: ${bol.cost}</li>
									<li>Instructions: ${bol.instructions}</li>
								</span>
								<a>Show more</a>
							</ul>
						</div>
					`;
					
				} else {
					console.log("Could not find Bill of Landing");
				}
			})
		}
	});

	updateLocBtn.addEventListener('click', async() => {
		let retrievedBoLs = localStorage.getItem('currentBoLs');
		let parsingBoLs = JSON.parse(retrievedBoLs);
		console.log("updateNewLoc: ", updateNewLoc.value, "updateReason: ", updateReason.value);

		if(parsingBoLs){
			let updated = false;
			parsingBoLs.forEach(bol => {
				if(bol.cargoId === parseInt(updateBol.value) && bol.sender.toString() === updateWallet.value.toString() && bol.status === status.shipping){
					console.log("bol found: ", bol);
					bol.currentLocation = updateNewLoc.value;
					updated = true;
				} else {
					console.log("bol not found");
				}
			});
			if(updated){
				let tempCargoArr = JSON.stringify(parsingBoLs);
				localStorage.setItem('currentBoLs', tempCargoArr);
				console.log("tempCargoLoc: ", tempCargoArr);
				alert(`Bill of Landing #${updateBol.value} Location has been updated. Reason of update: ${updateReason.value}`);
				updateNewLoc.value = "";
				updateReason.value = "";
				updateBol.value = "";
				updateWallet.value = "";
			} else {
				alert(`Bill of Landing #${updateBol.value} not found`)
			}
		}
	})

	acceptSearchBtn.addEventListener('click', async() => {
		searchResult.innerHTML = ``;
		let retrievedBoLs = localStorage.getItem('currentBoLs');
		let parsingBoLs = JSON.parse(retrievedBoLs);
		console.log("acceptBol: ", acceptBolInput.value, "acceptWallet: ", acceptWalletInput.value);

		if(parsingBoLs){
			parsingBoLs.forEach(bol => {
				if(bol.cargoId === parseInt(acceptBolInput.value) && bol.sender.toString() === acceptWalletInput.value.toString() && bol.status === status.shipping){
					console.log("bol found: ", bol);
					searchResult.innerHTML = `
						<div style="background-color: cornsilk; border: 1px solid black; width: 100%; padding: 10px;">
							<h4>Bill of Landing ID #${bol.cargoId}</h4>
							<h5 style="color: red;">Status: ${bol.status}</h5>
							<h5>Details</h5>
							<ul style="list-style-type: none; list-style: none; padding: 0;">
								<li>Sender: ${bol.sender.slice(0,6)}...${bol.sender.slice(-4)}</li>
								<li>Receiver: ${bol.receiver.slice(0,6)}...${bol.receiver.slice(-4)}</li>
								<li>Current Location: ${bol.currentLocation}</li>
								<li>Final Destination: ${bol.finalDestination}</li>
								<span id="points">...</span>
								<span id="more-bol-details">
									<li>Material: ${bol.quantity} ${bol.material}</li>
									<li>Cost: ${bol.cost}</li>
									<li>Instructions: ${bol.instructions}</li>
								</span>
								<a>Show more</a>
							</ul>
						</div>
					`;
				} else {
					console.log("Could not find Bill of Landing");
				}
			})
		}
	})

	getCargoBtn.addEventListener('click', async() => {
		let retrievedBoLs = localStorage.getItem('currentBoLs');
		let parsingBoLs = JSON.parse(retrievedBoLs);
		console.log("acceptBol: ", acceptBolInput.value, "acceptWallet: ", acceptWalletInput.value);

		if(parsingBoLs){
			let updated = false;
			parsingBoLs.forEach(bol => {
				if(bol.cargoId === parseInt(acceptBolInput.value) && bol.sender.toString() === acceptWalletInput.value.toString() && bol.status === status.shipping && bol.currentLocation.trim() === bol.finalDestination.trim()){
					console.log("bol delivered: ", bol);
					bol.status = status.accepted;
					updated = true;
				} else {
					console.log("bol not found or bol is still on the way");
				}
			});
			if(updated){
				let tempCargoArr = JSON.stringify(parsingBoLs);
				localStorage.setItem('currentBoLs', tempCargoArr);
				console.log("tempCargoLoc: ", tempCargoArr);
				alert(`The cargo has been delivered and accepted`);
				acceptBolInput.value = "";
				acceptWalletInput.value = "";
			} else {
				alert(`The cargo hasn't arrived yet`)
			}
		}
	})
	
});






