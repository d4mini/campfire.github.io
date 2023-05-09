//here it is
let startGame = false;
let choiceArea = document.getElementById('gameChoices');
var versionNumber = "0.12 Talktative Parrot"
var menuState = {
	"start": {choices: [{name: "get up"}, {name: "recall name"}]},
	"form": {objectsToBeNamed: []},
	"idle": {choices: [{name: "move"},{name: "inventory"}, {name:"look", target: "around"}]},
	"combat": {choices: [{name:"fight"}, {name:"items"}, {name:"run"}]},
	"fightMenu": {choices: []},
	"weaponMenu": {choices: []},
	"backpack": {choices: [{name:"back"}, {name:"worn"}]},
	"itemMenu": {choices: [{name:"back"}]},
	"container": {choices: [{name: "back"}]},
	"moveMenu": {choices: [{name: "map"}, {name: "back"}]},
	"inspect": {choices: []},
	"inspectMenu": {choices: []},
	"conversation": {choices: []},
	"wishMenu": {choices: [{name: "wish for", target: {name:"power"}},{name: "wish for", target: {name:"money"}},{name: "wish for", target: {name:"love"}}]},
	"empty": {choices: []} //left intenionally empty
};
var menuStateIndex = "start";
var previousMenuStateIndex = "start";
var inCombat = false;
var character = { pcName: "You", nickname: "",named: false,inventory: [], equipment: [], location: "clearing" , lastmove: "none"};



/* Main Functions */

function startQuest(){
	if (startGame === true) {
		logMessage("Your quest has already begun.");
		return;
	}
	else {
		choiceArea = document.getElementById('gameChoices');
		logMessage("You wake up in a forest clearing.");
		choiceArea.style.opacity = 0.5;
		updateChoices("start");
		startGame = true;
	}
}

function updateChoices(newState){
	choiceArea.innerHTML = '';
	if (newState != menuStateIndex) {
		previousMenuStateIndex = menuStateIndex;
	}
	menuStateIndex = newState;
	if(newState === "form"){
		//push a form instead!
		let newForm = document.createElement('form');
		newForm.autocomplete="off";
		newForm.addEventListener("submit", function(event){
			event.preventDefault();
			executeChoice("rename",[document.getElementById("myInput").value, menuState["form"].objectsToBeNamed[0]])
		})
		let input = document.createElement("input");
		input.type = "text";
		input.id = "myInput"
		newForm.appendChild(input);
		var submitBtn = document.createElement("button");
		submitBtn.type = "submit"
		submitBtn.textContent = "finish"
		newForm.appendChild(submitBtn);
		choiceArea.appendChild(newForm);
		return;
	}
	updateIdle();
	for (var i = 0; i < menuState[menuStateIndex].choices.length; i++) {
		let newParagraph = document.createElement('a');
		let choice = menuState[menuStateIndex].choices[i];
		let choiceText = choice.name;
		if (["pickup","openItemMenu", "inspectAt", "playerTalk", "considerBuy",].includes(choice.name)){
			choiceText = "";
		}
		else{
			choiceText += " ";
		}
		if (choice.name === "moveTo"){
			var matchingExit = areas[character.location].exits.find(function(exit){
				return exit.name === choice.target;
			})
			if (matchingExit.hasOwnProperty("direction")){
				choiceText = matchingExit.direction + ": ";
			}
			else{
				choiceText = matchingExit.transit + " ";
			}
			choiceText += matchingExit.exitName
		}
		if (choice.hasOwnProperty("target")) {
			var quantity = 1
			if (choice.hasOwnProperty("qty")) {
				quantity = choice.qty;
			}
			if (choice.name === "moveTo"){
				choiceText += ""
			}
			else if (choice.name === "fight with"){
				choiceText = choice.target[0].name
			}
			else if (choice.name === "wpnAction"){
				choiceText = choice.target[2].name
			}
			else if(["playerTalk"].includes(choice.name)){
				choiceText = choice.target[1].m
			}
			else if(["considerBuy", "considerSell"].includes(choice.name)){
				choiceText = pluralCheck(choice.target[1], choice.target[1].qty, "note");
			}
			else if(["pickup"].includes(choice.name)){
				choiceText = pluralCheck(choice.target[0], quantity, "note");
			}
			else if(["buyNo"].includes(choice.name)){
				choiceText = "buy " + choice.target[3];
			}
			else if(["sellNo"].includes(choice.name)){
				choiceText = "sell " + choice.target[3];
			}
			else if(["buy", "sell"].includes(choice.name)){
				choiceText = choice.name + " " + choice.target[1].name;
			}
			else if(["buy all", "sell all"].includes(choice.name)){
				choiceText = choice.name + " (" + choice.target[3] + ")";
			}
			else if(["inspectAt", "talk to", "attack"].includes(choice.name)){
				if(choice.target.name in npcDictionary){
					var targetnpc = npcDictionary[choice.target.name]
					//if we know them, use their name!
					if(targetnpc.known === true){
						choiceText += targetnpc.name
					}
					else{
						choiceText += targetnpc.short_description
					}
				}
				else if (choice.target === areas[character.location]){
					choiceText = "area"
				}
				else{
					choiceText += pluralCheck(choice.target, quantity, "note");
				}
			}
			else if (!(["drop","inspect", "take all", "make a wish"].includes(choice.name))){
				choiceText += pluralCheck(choice.target, quantity, "note");
			}
			else {
				choiceText = choice.name;
			}
		}
		newParagraph.innerHTML = choiceText;
		newParagraph.addEventListener('click', function() {executeChoice(choice.name, choice.target, choice.qty);});
		choiceArea.appendChild(newParagraph);
		if (menuState[menuStateIndex].choices.length > 1 && i != menuState[menuStateIndex].choices.length-1){
			let bar = document.createElement('span');
			bar.innerHTML = "|";
			choiceArea.appendChild(bar);
		}
	}
	
}

function executeChoice(choiceName, target, quantity) {
	var newMessage = "nullers";
	var newState = menuStateIndex;
	var delayChoices = 0;
	//test if we are clicking on an item	
  	switch (choiceName) {
    	case "get up":
      		// do something for "get up" choice
			newMessage = "You sit up and get to your feet. ";
			newState = "idle";
      	break;
		case "recall name":
			//push a form instead of just a button
			newMessage = "You try to recall your name.";
			menuState["form"].objectsToBeNamed.length = 0;
			menuState["form"].objectsToBeNamed.push(character);
			newState = "form";
		break;
		case "rename":
			//accept name
			if (target[0].length > 1){
				target[1].nickname = target[0]
				newMessage = "Your new name is " + character.nickname + "."
				newState = "start"
			}
			else {
				newMessage = "Please enter a longer name."
			}
		break;
		case "back":
			var backToState
      		switch(menuStateIndex){
				case "itemMenu":
					backToState = "container";
				break;
				case "container":
					backToState = "idle";
				break;
				case "moveMenu":
					backToState = "idle";
				break;
				case "inspectMent":
					backToState = "inspect"
				break;
				case "fightMenu":
					backToState = "combat"
				break;
				case "weaponMenu":
					backToState = "fightMenu"
				break;
				default:
					backToState = "idle";
				break;
			}
			newState = backToState;
      	break;
    	case "look":
			if (target === "around"){
				newMessage = describeArea(areas[character.location]);
			}
			//this may change if this has options to look at other stuff
			newState = "idle";
      	break;
    	case "inventory":
      		// do something for "backpack" choice
			if (character.inventory.length === 0){
				newMessage = "You are not carrying anything.";
			}
			else {
				newMessage = "You look in your backpack. There is " + itemLister(character.inventory) + ".";
				updateContainer(character.inventory);
				newState = "container"
			}
      	break;
		case "pickup...":
      		// do something for "pickup" choice
			updateContainer(areas[character.location].contents);
			newState = "container"
			newMessage = "What do you take?";
      	break;
		case "pickup":
			//find where the item is from
			if(target[1] === areas[character.location]){
				areas[character.location].contents = removeItem(target[0].name, target[0].qty, areas[character.location].contents)
				updateContainer(areas[character.location].contents);
				if (areas[character.location].contents.length === 0){
					newState = "idle"
				}
			}
			else{
				var fixtureIndex = areas[character.location].fixtures.findIndex(fixture => fixture.name === target[1].name)
				areas[character.location].fixtures[fixtureIndex].contents = removeItem(target[0].name, target[0].qty, areas[character.location].fixtures[fixtureIndex].contents)
				updateInspectMenu(areas[character.location].fixtures[fixtureIndex])
			}
			//add item to inventory
			character.inventory = addItem(target[0].name, quantity, character.inventory);
			var itemText = "the " + pluralCheck(target[0], quantity, "full");
			newMessage = "You pick up " + itemText + ".";

      	break;
		case "take all":
			//take all the items in an area
			target.forEach(function(item) {
				var indexToAddto = character.inventory.findIndex(existingItem => existingItem.name === item.name);
				if (item.qty === 'undefined'){
					item.qty = 7;
				}
				if (indexToAddto !== -1) {
					character.inventory[indexToAddto].qty += item.qty;
				}
				else {
					character.inventory.push({name: item.name, qty: item.qty, seen: true})
				}
				//character.inventory = addItem(item.name, item.qty, character.inventory);
			})
			//save description
			newMessage = " You pick up " + itemLister(target) + ".";
			target.length = 0;
			//updateContainer(areas[character.location].contents);
			newState = "idle";
		break;
		case "move":
      		// do something for "move" choice
			updateExits([character.location]);
			newState = "moveMenu"
			newMessage = exitLister(areas[character.location]) + ". Where do you move?";
      	break;
		case "moveTo":
      		// do something for "moveTo" choice
			const destination = areas[character.location].exits.find(exit => exit.name === target)
			newMessage = "You " + destination.transit + " the " + destination.exitName;
			if (destination.name !== destination.exitName) {
				newMessage += " and find yourself " + areas[destination.name].short_description
			}
			newMessage += "."
			character.location = destination.name;
			newState = "idle";
      	break;
		case "openItemMenu":
      		// open the item menu and display whatever options are there
			//update item Menu
			updateItemMenu(target, quantity);
			newState = "itemMenu";
			newMessage = "You take out the " + pluralCheck(target, quantity, "short") + ".";
      	break;
		case "use":
      		// do something for "use" choice
			newMessage = "You use the " + target.name;
      	break;
		case "eat":
		case "drink":
			// CONSUME
		  newMessage = "You " + choiceName + " the " + target.name + ".";
		  
		  if ("health" in itemDictionary[target.name]){
			const healed = roll(itemDictionary[target.name].health);
			newMessage += " It heals you for " + healed + " hp points."
		  }
		  character.inventory = removeItem(target.name, 1, character.inventory)
		  updateItemMenu(target, quantity-1);
		  if (quantity-1 === 0){
			newState = "container"
			updateContainer(character.inventory)
		  }
		break;
		case "equip":
			// do something for "equip" choice
			newMessage = equipItem(target);
			updateContainer(character.inventory);
			newState = "container"
		break;
		case "unequip":
			// do something for "equip" choice
			var equipSlot = itemDictionary[target.name].slot
			newMessage = unequipSlot(equipSlot);
			updateContainer(character.equipment);
			newState = "container"
		break;
		case "inspect":
			// do something for "inspect" choice
			if(target.hasOwnProperty("name")){
				if (target.name in itemDictionary){
					newMessage = itemDictionary[target.name].long_description;
				}
			}
			else{
				newMessage = "What would you like to inspect?";
				newState = "inspect"
			}
		break;
		case "inspectAt":
			//first check if we are just looking around
			if (target === areas[character.location]){
				newMessage = describeArea(areas[character.location])
				break;
			}
			//make array of things to check, combining fixtures and npcs ----> and items????
			var fixtureArray = areas[character.location].fixtures
			var focus
			//logMessage(target)
			//tell fixture description
			if (target.name in npcDictionary){
				focus = npcDictionary[target.name]
				newMessage = capFirst(focus.pronouns[0])
				if (["he", "she", "it"].includes(focus.pronouns[0])){newMessage += "'s "}else{newMessage += " are "}
				newMessage += focus.long_description + ". ";
				newMessage += capFirst(focus.pronouns[0])
				if (["he", "she", "it"].includes(focus.pronouns[0])){newMessage += " is "}else{newMessage += " are "}
				newMessage += focus.doing + ". ";
			}
			else {
				focus = fixtureArray.find(fixture => fixture.name === target.name);
				newMessage = "It's " + focus.long_description + ".";	
			}
			if ("open" in focus || "fishing" in focus || "talk" in focus || "uses" in focus || "hostility" in focus){
				//logMessage("You can do something with this!")
				updateInspectMenu(target);
				newState = "inspectMenu"
			}
		break;
		case "talk...":
			//open fixture like menu
		break;
		case "talk to":
			//initiate conversation
			//first start us off with the nps's greeting
			//check if they have met before
			var converser = npcDictionary[target.name]
			var greeting
			if (converser.hasOwnProperty = "met" && converser.met === true){
				//deliver greeting 1
				greeting = "g1"
			}
			else{
				//deliver greeting 0
				greeting = "g0"
				npcDictionary[target.name].met = true;
			}
			advanceConvo(converser, greeting, 0)
			newState="empty"
		break;
		case "playerTalk":
			var nextLineSpeed
			if (/^\".*\"$/.test(target[1].m)){
				newMessage = mesay(target[1].m)
				delayChoices += -400;
				nextLineSpeed = 800 + newMessage.length * 20
			}
			else {
				nextLineSpeed = 0
			}
			//test for replace
			if (target[0].talk.find(line => line.label === target[1].next).hasOwnProperty("replace")){
				//replace the line for next time!
				//find our replies
				var repliesArray = target[0].talk.find(option => option.label === target[2]).replies
				//index of old reply
				var oldReplyIndex = repliesArray.findIndex(reply => reply === target[1])
				//find our new line
				var newLine = target[0].talk.find(line => line.label === target[1].next).replace
				
				if (oldReplyIndex !== -1) { // if the object is found
					repliesArray.splice(oldReplyIndex, 1, newLine); // remove the old object and insert the new object
				  }
			}
			//aim for next
			newState = "empty"
			advanceConvo(target[0], target[1].next, nextLineSpeed)
		break;
		case "considerBuy":
		case "considerSell":
			//make the product held by the npc
			target[0].focusItem.length = 0;
			target[0].focusItem.push(target[1])
			//find the next line
			var buyOrSell
			if(choiceName === "considerBuy"){buyOrSell="buy0"}else{buyOrSell="sell0"}
			if(buyOrSell === "sell0" && target[1].name === "gold"){
				//Maybe we replace gold with a comparison against a no-sell list
				newMessage = "<i>You cannot sell your gold</i>"
				break;
			}
			advanceConvo(target[0], buyOrSell, 0)
			newState = "empty"
		break;
		case "buy":
		case "buy all":
		case "buyNo":
		case "sell":
		case "sell all":
		case "sellNo":
		case "trade":
			//the ultimate trading experience!!
			var tradeArray = [] //[getting item-0, getting amount-1, giving item-2, giving amount-3]
			target[0].focusItem.length = 0
			target[0].focusItem.push({name: target[1].name, qty: target[3]})
			//if buyin
			if(choiceName.includes("buy")){tradeArray = [target[1].name, target[3], "gold" , target[3] * target[4], "buy1", "buy3"]}
			//if sellin
			else if(choiceName.includes("sell")){tradeArray = ["gold", target[3]*target[4], target[1].name, target[3], "sell1", "sell3"]}
			//if tradin
			else{tradeArray = [target[0], target[3], target[5].name, target[5].qty, "trade1", "trade3"]}
			//do the transanction. //check the player has the item
			var givingStock = checkItemQty(tradeArray[2], character.inventory)
			var neededStock = tradeArray[3]
			if (givingStock >= neededStock){
				character.inventory = removeItem(tradeArray[2], neededStock, character.inventory)
				//remove from npc's inventory (if not gold)
				if (tradeArray[0] != "gold"){target[0].contents = removeItem(tradeArray[0], tradeArray[1], target[0].contents)}
				//give the npc the item (unless its gold)
				if (tradeArray[2] != "gold"){target[0].contents = addItem(tradeArray[2], neededStock, target[0].contents)}
				//give us the goods
				character.inventory = addItem(tradeArray[0], tradeArray[1], character.inventory)
				target[0].justBought = true;
				advanceConvo(target[0], tradeArray[4], 0)
			}
			else {
				//too damn bad! buy3
				advanceConvo(target[0], tradeArray[5], 0)
			}
			newState = "empty"
		break;
		case "open":
			var operable = areas[character.location].fixtures.find(hinges => hinges.name === target.name)
			//is it locked?
			if (operable.hasOwnProperty("lock")){
				//do we have the key in our inventory?
				if(character.inventory.find(key => key.name === operable.lock)){
					//open a the container
					newMessage = "You open the " + target.name + " with the " + operable.lock + "."
					operable.open = true;
				}
				else{
					newMessage = "The " + target.name + " is locked."
					break;
				}
			}
			else{
				newMessage = "You open the " + target.name + "."
				operable.open = true;
			}
			if (operable.hasOwnProperty("contents")){
				if (operable.contents.length > 0 ){
					newMessage += " Inside, there is " + itemLister(operable.contents) + "."
				}
			}
			updateInspectMenu(target);
		break;
		case "close":
			var operable = areas[character.location].fixtures.find(hinges => hinges.name === target.name)
			//is it locked?
			newMessage = "You close the " + target.name;
			operable.open = false;
			if (operable.hasOwnProperty("lock")){
				newMessage += " and it locks."
			}
			else{
				newMessage += "."
			}
			updateInspectMenu(target);
		break;
		case "make a wish":
			//open the wish menu!
			newMessage = "What do you wish for?"
			newState = "wishMenu"
		break;
		case "wish for":
			//make a wish!
			newMessage = "You throw a coin into the well and wish for " + target.name + ". You look around, but nothing seems to have changed."
		break;
		case "attack":
			//attack this thing!!!
			menuState["combat"].choices.find(option => option.name === "fight").target = target;
			newState = "combat"
		break;
		case "drop":
			newMessage = "You drop the " + pluralCheck(target, quantity, "short") + " in the " + character.location + ".";
			//remove the item from the inventory array
			character.inventory = removeItem(target.name, quantity, character.inventory)
			updateContainer(character.inventory)
			//add the item to the location contents
			areas[character.location].contents = addItem(target.name, quantity, areas[character.location].contents)
			//return to menu
			if (character.inventory.length === 0){
				newState = "idle"
			}
			else {
				newState = "container"
			}
		break;
		case "equipment":
      		// do something for "equipment" choice
			if (character.equipment.length === 0){
				newMessage = "You are not equipped with anything.";
			}
			else {
				newMessage = "You are currently equipped with " + itemLister(character.equipment) + ".";
				updateContainer(character.equipment);
				newState = "container"
			}
      	break;
		case "fish with":
			//check that we can fish here
			if (areas[character.location].fixtures.find(fixture => fixture.hasOwnProperty("fishing"))){
				newMessage = "You fish with your " + target.name + "..."
				delayChoices += 1600;
			}
			else {
				newMessage = "There's nowhere to fish here."
				break;
			}
			//actually do the fishing
			// fishing: 1d100, must get less than fishingGear number, then random chance at contents?
			// or, items like fish have a difficulty DC, and you roll 1d100+fishingGear to hit.
			var fishingChance = itemDictionary[target.name].fishingGear
			var fishingResult = ""
			var fishingRoll = roll("1d100+0")
			if (fishingRoll < fishingChance){
				var fishZoneIndex = areas[character.location].fixtures.findIndex(fixture => fixture.hasOwnProperty("fishing"))
				var fishZone = areas[character.location].fixtures[fishZoneIndex]
				if (fishZone.fishing.length < 1) {
					fishingResult = "Nothing seems to be biting today."
				}
				else{
					var stock = fishZone.fishing.flatMap(item => Array.from({length: item.qty}, () => ({name: item.name})));
					var itemRoll = "1d" + stock.length + "+0"
					var fishingCatch = stock[roll(itemRoll)-1]
					fishingResult = " You catch a " + fishingCatch.name + "!"
					if (["old boots"].some(item => fishingCatch.name.includes(item))) {
						fishingResult = "You think there's something on the line, but it's just some " + fishingCatch.name + "."
					}
					character.inventory = addItem(fishingCatch.name, 1, character.inventory)//maybe here is where we open a menu to throw it back?
					areas[character.location].fixtures[fishZoneIndex].fishing = removeItem(fishingCatch.name, 1, fishZone.fishing)
				}	
			}
			else {
				fishingResult = "You don't catch anything."
			}
			setTimeout(function(){
				logMessage(fishingResult);
			}, 2000);
		break;
		case "fish at":
			//open up fishing menu
			newMessage = "How would you like to fish?"
			updateFishingStartMenu()
			newState = "container"
		break;
    	case "fight":
      		// do something for "fight" choice
			updateFightMenu(target)
			newState = "fightMenu"
      	break;
		case "fight with":
			updateWeaponMenu(target[0], target[1])
			newState = "weaponMenu"
		break;
		case "wpnAction":
			//perform the wpn action I guess
			//do you know the target personally?
			resolveAttack(character, target[1], target[2], target[0])
		break;
		case "items":
      		// do something for "run" choice
      	break;	
    	case "run":
      		// do something for "run" choice
			newState = "moveMenu"
      	break;
    	default:
      	// handle unrecognized choice
			newMessage = "The fates have not determined that choice yet"
      	break;
  }
	if (newMessage != "nullers"){
		logMessage(newMessage);
		delayChoices += 400;
		choiceArea.innerHTML = '';
	}
	setTimeout(function(){
		updateChoices(newState);
	}, delayChoices);
	
}

function roll(command){
	//check if we have dice
	if(!/[d+]/.test(command)){
		const modifier = parseInt(command);
		return{
			numDice: 0,
			diceSides: 0,
			modifier,
		};
	};

	//split the string into 3
	const [numDiceStr, diceSidesStr, modifierStr] = command.split(/[d+]/)
	const numDice = parseInt(numDiceStr);
	const diceSides = parseInt(diceSidesStr);
	const modifier = parseInt(modifierStr);

	//roll those dice!
	const rolls = [];
	for (let i = 0; i < numDice; i++) {
		const roll = Math.floor(Math.random() * diceSides) + 1;
		rolls.push(roll);
	}
	const total = rolls.reduce((acc, roll) => acc + roll, 0) + modifier;
	
	return total;
}

/* Inventory Functions */

function checkItemQty(itemName, arr) {
	var itemIndex = arr.findIndex(item => item.name === itemName);
	if(itemIndex === -1){
		logMessage("Not found in inventory")
		return 0;
	}
	var quantity = arr[itemIndex].qty
	return quantity;
}

function removeItem(itemName, deltaQty, arr){
	var indexToRemove = arr.findIndex(item => item.name === itemName);
	if (indexToRemove !== -1) {
		//test if we will have leftovers
		var currentAmount = arr[indexToRemove].qty;
		if (deltaQty < currentAmount) {
			arr[indexToRemove].qty -= deltaQty;
			logMessage("Debug: Removed " + deltaQty + " " + itemName + " and there is " + arr[indexToRemove].qty + " remaining.")
		}
		else if (deltaQty == currentAmount){
			arr = arr.filter((item, index) => index !== indexToRemove)
		}
		else {
			logMessage("Debug: Error! You're asking for a quantity that we don't have!");
		}
		return arr;
	}
	else {
		logMessage("Debug: We couldn't find enough of that item.")
	}
}

function addItem(itemName, deltaQty, arr){
	//check if we already have a matching item
	var indexToAddto = arr.findIndex(item => item.name === itemName);
	if (deltaQty === 'undefined'){
		deltaQty = 7;
	}
	if (indexToAddto !== -1) {
		arr[indexToAddto].qty += deltaQty;
	}
	else {
		arr.push({name: itemName, qty: deltaQty, seen: true})
	}
	return arr;
}

function unequipSlot(slotToUnequip){
	var previousItem = character.equipment.find(item => itemDictionary[item.name].slot === slotToUnequip)
	var description;
	if (previousItem !== undefined){
		//remove that item
		character.equipment = removeItem(previousItem.name, 1, character.equipment)
		//add it back to the inventory
		character.inventory = addItem(previousItem.name, 1, character.inventory)
		//describe it!
		if (["weapon", "shield"].includes(unequipSlot)){
			description = "You put away your " + previousItem.name + ". ";
		}
		else {
			description = "You unequip your " + previousItem.name + ". ";
		}
	}
	else{
		description = "";
	}
	return description;
}

function equipItem(itemToEquip){
	var equipSlot = itemDictionary[itemToEquip.name].slot
	var description
	//check if you already have an item in that slot
	description = unequipSlot(equipSlot);
	//equip the item
	character.equipment = addItem(itemToEquip.name, 1, character.equipment);
	//remove the item from inventory
	character.inventory = removeItem(itemToEquip.name, 1, character.inventory);
	//describe the action
	if (["weapon", "shield"].includes(equipSlot)){
		description += "You wield the " + itemToEquip.name + ".";
	}
	else {
		description += "You put the " + itemToEquip.name + " on your " + equipSlot + ".";
	}
	return description;
}

/* String Managers */

function pluralCheck(item, quantity, type){
	if (!(item.name in itemDictionary)) {
		return item.name;
	}
	var finalized = "";
	if (quantity === 1) {
		if(["a"].includes(type)){
			finalized += "a "
		}
		finalized += itemDictionary[item.name].name
	}
	else {
		if (["full", "a"].includes(type)){
			finalized += quantity + " "
		}
		finalized += itemDictionary[item.name].plural;
		if (type === "note"){
			finalized += "(" + quantity + ")"
		}
	}
	return finalized;
}

function capFirst(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function mesay(str, manner){
	var speakerName = character.pcName
	var newLine = speakerName.toUpperCase()
	newLine += ": " + str
	return newLine
}

function theysay(whom, lineLabel, manner){
	var speakerName
	var playline = whom.talk.find((line) => {
		return line.hasOwnProperty("label") && line.label === lineLabel;
	  });
	//determine if we know them
	if (whom.known === true){
		speakerName = whom.name
	}
	else {
		speakerName = whom.short_description;
	}
	var newLine = speakerName.toUpperCase()
	var str
	if (playline.hasOwnProperty("npc")) {
		str = playline.npc
		newLine += ": "
	}
	else if(playline.hasOwnProperty("scene")){
		str = "<i>" + playline.scene + "</i>"
		newLine = ""
	}
	else{
		newLine = ""
		return newLine;
	}
	//test if we are trying to list store items
	if(lineLabel === "shop0"){
		str += itemLister(npcDictionary[whom.name].contents) + ".\""
	}
	//test for our keywords!
	if (str.includes("#item#")) {
		str = str.replace(/#item#/g, pluralCheck(whom.focusItem[0], whom.focusItem[0].qty, "short"));
	}
	if (str.includes("#cost#")) {
		var costText
		var cost = calcPrice(whom.focusItem[0], 1, whom, "buy")
		if (whom.focusItem[0].qty > 1){
			costText = "They're <b>" + pluralCheck({name: "gold"}, cost, "a") + "</b> each"
		}
		else {
			costText = "It's <b>" + pluralCheck({name: "gold"}, cost, "a") + "</b>";
		}
		str = str.replace(/#cost#/g, costText);
	}
	if (str.includes("#costall#")) {
		var costText
		var cost = calcPrice(whom.focusItem[0], whom.focusItem[0].qty, whom, "buy")
		costText = "<b>" + pluralCheck({name: "gold"}, cost, "a") + "</b>";
		str = str.replace(/#costall#/g, costText);
	}
	if (str.includes("#price#")) {
		var priceText
		var price = calcPrice(whom.focusItem[0], 1, whom, "sell")
		priceText = "<b>" + pluralCheck({name: "gold"}, price, "a") + "</b>"
		if (whom.focusItem[0].qty > 1){
			priceText += " each"
		}
		str = str.replace(/#price#/g, priceText);
	}
	if (str.includes("#priceall#")) {
		var priceText
		var price = calcPrice(whom.focusItem[0], whom.focusItem[0].qty, whom, "sell")
		priceText = "<b>" + pluralCheck({name: "gold"}, price, "a") + "</b>"	
		str = str.replace(/#priceall#/g, priceText);
	}
	if (["bold"].includes(manner)){
		newLine += "<b>" + str + "</b>";
	}
	else{
		newLine += str;
	}
	return newLine;
}

function findLabel(npc, labelToFind){
	return npc.talk.find(line => line.label === labelToFind);
}

function itemLister(container) {
	var newItemList = "";
	container.forEach(function(item, index) {
		if (index === container.length - 1 && container.length > 1){
			newItemList += " and ";
		}
		if (item.hasOwnProperty("qty")){
			newItemList += pluralCheck(item, item.qty, "a");
		}
		else {newItemList += pluralCheck(item, 1, "a");}
		
		if (container.length > 2 && index < container.length - 1) {
			newItemList += ", ";
		}
	});
	return newItemList;
}

function exitLister(area) {
	var areaExits = "There is ";
		area.exits.forEach(function(path, index) {
			if (index === area.exits.length - 1 && area.exits.length > 1){
				areaExits += " and ";
			}
			areaExits += "a " + path.exitName;
			var directionText
			if (path.hasOwnProperty("direction")){
				directionText = path.direction
				areaExits += " to the " + path.direction
			}
			if (index != area.exits.length - 1 && area.exits.length > 1){
				areaExits += ", ";
			}
		});
	return areaExits;
}

function describeArea(area) {
	//add area description
	var areaDesc = "You are in " + area.long_description;
	//add fixtures
	if (area.fixtures.length > 0){
		areaDesc += " There is a "
		area.fixtures.forEach(function(fixture, index) {
			if (area.fixtures.length > 1 && index === area.fixtures.length-1){
				areaDesc += " and a "
			}
			areaDesc += fixture.name
			if (area.fixtures.length > 2 && index < area.fixtures.length-1){
				areaDesc += ", a "
			}
		})
		areaDesc += " here."
	}
	//add items
	if (area.contents.length > 0) {
		var areaContents = " There is ";
		areaContents += itemLister(area.contents);
		areaContents += " here.";
		//iterate through items to make them seen
		area.contents.forEach(function(item) {
			item.seen = true;
		})
		areaDesc += areaContents;
	}
	// add exits
	if (area.exits.length > 0) {
		areaDesc += " " + exitLister(area) + ". ";
	}
	//updateChoices("idle");
	return areaDesc;
}

function calcPrice(itemName, itemQty, merchant, type){
var item = itemDictionary[itemName.name]
var merchantMod = 1
if (type === "buy") {
	merchantMod = npcDictionary[merchant.name].priceMod;
}
else if (type === "sell"){
	merchantMod = 2 - (npcDictionary[merchant.name].priceMod);
}
var price = item.value * merchantMod;
var price = Math.ceil(price) * itemQty;
return price;
}

/* Menu Updaters */

function updateIdle(){
	//check for items to add or remove the 'pickup...' option
	//check if there are items, any are seen, and there is no pickup option
	var itemArray = areas[character.location].contents;
	var fixtureArray = areas[character.location].fixtures;
	var npcArray = areas[character.location].npcs;
	menuState["idle"].choices.length = 0;
	menuState["idle"].choices.push({name: "move"});
	menuState["idle"].choices.push({name: "inventory"});
	menuState["idle"].choices.push({name: "inspect", target: "..."});
	//menuState["idle"].choices.push({name: "look", target: "around"});
	menuState["inspect"].choices.length = 0;
	menuState["inspect"].choices.push({name: "inspectAt", target: areas[character.location]});
	npcArray.forEach(function(person) {
		menuState["inspect"].choices.push({name: "inspectAt", target: person});
	})
	fixtureArray.forEach(function(fixture) {
		menuState["inspect"].choices.push({name: "inspectAt", target: fixture});
	})
	menuState["inspect"].choices.push({name: "back"});
	if (itemArray.length > 0 && itemArray.some(item => item.seen === true)) {
		//test how many objects are seen
		menuState["inspect"].choices.push({name: "pickup..."});
	}
}

function updateInspectMenu(object){
	menuState["inspectMenu"].choices.length = 0;
	//logMessage("updating inspect menu")
	//Is this a person?
	if (object.name in npcDictionary){
		menuState["inspectMenu"].choices.push({name: "talk to", target: object})
		if (object.hasOwnProperty("hostility")){
			menuState["inspectMenu"].choices.push({name: "attack", target: object})
		}
	}
	//Is this a fixture?
	if (areas[character.location].fixtures.some(fixture => fixture.name === object.name)) {
		var inspectableFixture = areas[character.location].fixtures.find(thing => thing.name === object.name)
		var showThings = true
		//logMessage("Hey this is a fixture!");
		//Does it open?
		if(object.hasOwnProperty("open")){
			//is it open?
			if(object.open === false){
				menuState["inspectMenu"].choices.push({name: "open", target: object})
				showThings = false;
			}
			else{
				menuState["inspectMenu"].choices.push({name: "close", target: object})
			}	
		}
		//Can you fish at it?
		if(object.hasOwnProperty("fishing")){
			menuState["inspectMenu"].choices.push({name: "fish at", target: object})
		}
		//Are there other more niche uses?
		if(object.hasOwnProperty("uses")){
			object.uses.forEach(function(fixtureUse){
				menuState["inspectMenu"].choices.push({name: fixtureUse, target: object})
			})
		}
		//Can you exit through it?
		if(object.hasOwnProperty("exits")){
			//are the exits visible?
			if(showThings === true){
				updateExits(character.location)
				object.exits.forEach(function(exitOption){
					menuState["inspectMenu"].choices.push({name: "moveTo", target: exitOption.name})
				})
			}
		}
		//Are there objects to pick up?
		if(object.hasOwnProperty("contents")){
			if(showThings === true){
				object.contents.forEach(function(contentItem){
					if (!(contentItem.hasOwnProperty("qty"))){
						contentItem.qty = 1
					}
					logMessage("adding "+contentItem.qty + " " + contentItem.name + " to the inspectMenu")
					menuState["inspectMenu"].choices.push({name: "pickup", target: [contentItem, object], qty: contentItem.qty})
				})
			}
		}

	  }
	menuState["inspectMenu"].choices.push({name: "back"});
}

function updateContainer(thingArray) {
	//clear the container choices
	menuState["container"].choices.length = 0;
	//add each item as a choice
	var action
	var itemArray = thingArray
	var exitArray = []
	var showItems = true;
	if (areas[character.location].fixtures.includes(thingArray)){
		if(thingArray.hasOwnProperty("exits")){
			exitArray = thingArray.exits
		}
		if(thingArray.hasOwnProperty("contents")){
			itemArray = thingArray.contents
		}
		else{
			itemArray = [];
		}
	}
	if (thingArray.name in npcDictionary){
		menuState["container"].choices.push({name: "talk to", target: thingArray.name})
		showItems = false;
	}
	else if(thingArray.hasOwnProperty("open")){
		if(thingArray.open === false){
			menuState["container"].choices.push({name: "open", target: thingArray.name});
			//itemArray.length = 0;
			showItems = false;
		}
		else{
			menuState["container"].choices.push({name: "close", target: thingArray.name});
			showItems = true;
		}
	}
	if(thingArray.hasOwnProperty("fishing")){
		menuState["container"].choices.push({name: "fish at", target: thingArray.name})
	}
	if (thingArray === character.inventory){
		action = "openItemMenu"
		menuState["container"].choices.push({name: "equipment"});
	}
	else if (thingArray === character.equipment) {
		action = "unequip"
	}
	else{
		action = "pickup"
		if (itemArray.length > 1 && showItems === true){
			menuState["container"].choices.push({name: "take all", target: itemArray});
		}
	}
	if (showItems === true) {
		/* exitArray.forEach(function(exitOption){
			menuState["container"].choices.push({name: "moveTo", target: exitOption.name})
			areas[character.location].exits.push({name: exitOption.name, exitName: exitOption.exitName, transit: exitOption.transit})
		}) */
		itemArray.forEach(function(itemIn) {
			if (!(itemIn.hasOwnProperty("qty"))){
				itemIn.qty = 1
			}
			if (action === "pickup"){
				menuState["container"].choices.push({name: action, target: [itemIn, areas[character.location]], qty: itemIn.qty});
			}
			else{
				menuState["container"].choices.push({name: action, target: itemIn, qty: itemIn.qty});
			}
		})
	}
	else{
		//remove the exits from the exit list
		//loop through the exits and test if any coincide with our exitArray
		//areas[character.location].exits.forEach(function(exitToTest){
			//if (exitArray.some(extraExit => extraExit.name === exitToTest.name)){
				//splice it from the exits array
				//areas[character.location].exits = areas[character.location].exits.filter((item, index) => index !== exitToTest)
			//}
		//})
	}
	//add the back option
	menuState["container"].choices.push({name: "back"});
	//updateChoices("container");
}

function updateItemMenu(target, quantity){
	menuState["itemMenu"].choices.length = 0;
	if (itemDictionary[target.name].hasOwnProperty("use")){
		//add whatever use case is in the item
		menuState["itemMenu"].choices.push({name: itemDictionary[target.name].use, target: target, qty: quantity})
	}
	menuState["itemMenu"].choices.push({name: "inspect", target: target, qty: quantity})
	menuState["itemMenu"].choices.push({name: "drop", target: target, qty: quantity})
	menuState["itemMenu"].choices.push({name: "back"})
}

function updateFishingStartMenu(){
	menuState["container"].choices.length = 0;
	//find each inventory item that you can fish with!
	const fishingGearArray = character.inventory.filter(item => itemDictionary.hasOwnProperty(item.name) && itemDictionary[item.name].hasOwnProperty("fishingGear"));
	fishingGearArray.forEach(function(gear) {
		menuState["container"].choices.push({name: "fish with", target: gear});
	})
	menuState["container"].choices.push({name: "fish with", target: {name: "your bare hands", qty: 1}})
	// recall fishing? inspect hole?
	//menuState["container"].choices.push({name: "inspect"})
	menuState["container"].choices.push({name: "back"});
}

function updateExits(area) {
	//clear choices
	menuState["moveMenu"].choices.length = 0;
	//test fixtures for exits
	areas[area].fixtures.forEach(function(fixture){
		if(fixture.hasOwnProperty("exits")){
			//if open or does not have open
			if(fixture.open === true || !(fixture.hasOwnProperty("open"))){
				//add exit TO AREA for each exit
				fixture.exits.forEach(function(fixtureExit){
					//see if it's already there
					if(areas[area].exits.some(existingExit => existingExit.name === fixtureExit.name)){
						//do nothing
					}
					else{
						areas[area].exits.push({name: fixtureExit.name, exitName: fixtureExit.exitName, transit: fixtureExit.transit});
					}
				})
			}
			else {
				//remove fixture exits that don't belong
				fixture.exits.forEach(function(fixtureExit){
					//see if it's already there
					if(areas[area].exits.some(existingExit => existingExit.name === fixtureExit.name)){
						//remove it!
						var exitIndexToRemove = areas[area].exits.findIndex(exitToRemove => exitToRemove.name === fixtureExit.name)
						areas[area].exits = areas[area].exits.filter((anExit, index) => index !== exitIndexToRemove)
					}
				})
			}
		}
	})
	//add each exit
	areas[area].exits.forEach(function(exit) {
		menuState["moveMenu"].choices.push({name: "moveTo", target: exit.name});
	})
	//add a hide option
	menuState["moveMenu"].choices.push({name: "hide"});
	//add the back option
	menuState["moveMenu"].choices.push({name: "back"});
	//updateChoices("moveMenu");
}

function advanceConvo(talker, labelName, chatDelay){
	//make variable for the string
	var newChatString = theysay(talker, labelName)
	//get the next line as a variable
	var nextLine = talker.talk.find(line => line.label === labelName)
	//Set chat speed
	var chatSpeed = 800 + newChatString.length * 20
	if (newChatString === ""){
		chatSpeed = 0;
	}
	//check if we are getting introduced
	if (labelName === "who0"){
		npcDictionary[talker.name].known = true;
	}
	//check if we are replacing an option? maybe in playerTalk
	//check if we are getting a quest
	//check if we are getting an item
	//check if we are giving an item
	
	//test if next line will be our last
	if(nextLine.next === "end"){ //say the line, and then end the convo.
		//start a timeout to give a break before next line
		setTimeout(function(){
			logMessage(newChatString);
			setTimeout(function(){
				updateChoices("inspectMenu");
			}, chatSpeed);
		}, chatDelay);
	}
	else{ //say the line, and go to next or replies
		setTimeout(function(){
			//say the line bart
			if (newChatString != ""){
				logMessage(newChatString)
			}
			//test if the next line has player replies
			if (nextLine.hasOwnProperty("replies")){
				//break the cycle
				updateConvo(talker, labelName)
				setTimeout(function(){
					updateChoices("conversation");
				}, chatSpeed);
			}
			else if (nextLine.hasOwnProperty("next")){
				//test if the npc has no items to sell
				var nextLabel = nextLine.next
				if(nextLine.next === "shop0"){
					if(talker.contents.length == 0){nextLabel = "shop9"}
				}
				if(nextLine.next === "shophub1"){
					if(character.inventory.length == 0){nextLabel = "sell3"}
				}
				//play it again sam
				advanceConvo(talker, nextLine.next, chatSpeed)
				updateChoices("empty")
			}
			else{
				//just in case, so we are not having a loop
				logMessage("Negotiations have failed")
				updateChoices("inspectMenu")
			}
		}, chatDelay)
	}
}

function updateConvo(goober, labelName){
	//this just updates the menu, handles the replies
	menuState["conversation"].choices.length = 0;
	//check if we are buying
	switch (labelName){
		case "hub0":
			goober.justBought = false;
		break;	
		case "shophub0":
		case "shophub1":
			//what are ya buyin?/sellin?
			var shophubArray = []
			if(labelName === "shophub0"){shophubArray = [goober.contents, "considerBuy", "shop9"]}
			if(labelName === "shophub1"){shophubArray = [character.inventory, "considerSell", "sell3"]}
			shophubArray[0].forEach(function(product){
				menuState["conversation"].choices.push({name: shophubArray[1], target: [goober, product, labelName]});
			})
			if (shophubArray[0].length === 0){
				advanceConvo(goober, shophubArray[2], 0)
				break;
			}
			var declineReply
			if(goober.justBought === true){
				declineReply = {m: "decline", next: "shop8"}
			}
			else{
				declineReply = {m: "decline", next: "shop7"}
			}
			menuState["conversation"].choices.push({name: "playerTalk", target: [goober, declineReply, labelName]});
		break;
		case "buy0":
		case "sell0":
			//give buy options - or sell options!
			//first find whatever product it is
			var cartItem = goober.focusItem[0]
			var buySellArray
			if (labelName === "buy0"){buySellArray=["buy", "buyNo", "buy all"]}
			else if (labelName === "sell0"){buySellArray=["sell", "sellNo", "sell all"]}
			var cartPrice = calcPrice(goober.focusItem[0], 1, goober, buySellArray[0])
			if (cartItem.qty === 1){
				menuState["conversation"].choices.push({name: buySellArray[0], target: [goober, cartItem, labelName, 1, cartPrice]});
			}
			else{
				var bulkArray = [1] //for every bulk option, push another buy/se;; option
				if (cartItem.qty >= 5){
					bulkArray.push(5)
				}
				if (cartItem.qty >= 10){
					bulkArray.push(10)
				}
				bulkArray.forEach(function(bulkOption){
					menuState["conversation"].choices.push({name: buySellArray[1], target: [goober, cartItem, labelName, bulkOption, cartPrice]});
				})
				menuState["conversation"].choices.push({name: buySellArray[2], target: [goober, cartItem, labelName, cartItem.qty, cartPrice]});
			}
		break;
	}
	//add each response
	replyArray = goober.talk.find(line => line.label === labelName).replies
	replyArray.forEach(function(response){
		menuState["conversation"].choices.push({name: "playerTalk", target:[goober, response, labelName]});
	})
}

function updateFightMenu(enemy){
	//first make the combat menu empty
	menuState["fightMenu"].choices.length = 0;
	//what are we wielding?
	var weaponArray = character.equipment.filter(item => itemDictionary[item.name].slot === "weapon")
	weaponArray.forEach(function(weapon){
		menuState["fightMenu"].choices.push({name: "fight with", target: [weapon, enemy]})
	})
	//maybe an option for unarmed? 
	if (weaponArray.length === 0){
		menuState["fightMenu"].choices.push({name: "fight with", target: [{name: "your bare hands"}, enemy]})
	}
	//push the back option
	menuState["fightMenu"].choices.push({name: "back"})
}
function updateWeaponMenu(weapon, enemy){
	menuState["weaponMenu"].choices.length = 0;
	//find all the moves for the weapon!
	const weaponTags = itemDictionary[weapon.name].tags
	var actionArray = Object.keys(actionDict).filter(move => {
		const moveTags = actionDict[move].tags;
		return moveTags.some(tag => weaponTags.includes(tag));
	});
	actionArray.forEach(function(availableAction){
		menuState["weaponMenu"].choices.push({name: "wpnAction", target: [weapon, enemy, actionDict[availableAction]]})
	})

	//push the back option
	menuState["weaponMenu"].choices.push({name: "back"})
}
function resolveAttack(fighter, fightTarget, fightmove, weapon){
//ok this is where we resolve it!
//who is attacking?
var fighterName
var fighterPronouns
var targetName
var targetPronouns
var randomTry
if(fighter === character){
	fighterName = "you";
	fighterPronouns = ["you", "you", "your"];
	randomTry = fightmove.tryPhrases[Math.floor(Math.random() * fightmove.tryPhrases.length)]
}
else{
	if(npcDictionary[fighter.name].known === true){
		fighterName = npcDictionary[fighter.name].name;
	}else{
		fighterName = "the " + npcDictionary[fighter.name].short_description
	}
	fighterPronouns = npcDictionary[fighter.name].pronouns
	randomTry = fightmove.otherTryPhrases[Math.floor(Math.random() * fightmove.tryPhrases.length)]
}
if(fightTarget === character){
	targetName = "you";
	targetPronouns = ["you", "you", "your"];
}
else{
	if(npcDictionary[fightTarget.name].known === true){
		targetName = npcDictionary[fightTarget.name].name;
	}else{
		targetName = "the " + npcDictionary[fightTarget.name].short_description
	}
	targetPronouns = npcDictionary[fightTarget.name].pronouns
}
// assemble the phrase!
var longerPart = " with " + fighterPronouns[2] + " " + weapon.name + "!";
//see if the fighter has done this before
if (fighter.hasOwnProperty("lastmove")){
	if (fighter.lastmove === fightmove){
		longerPart = "."
	}
}
var attackTryText = fighterName + " " + randomTry + " " + targetName + longerPart;
attackTryText = capFirst(attackTryText);
logMessage(attackTryText);
fighter.lastmove = fightmove;
setTimeout(function(){
	logMessage("HIT!")
	setTimeout(function(){
		logMessage("This is the hit text!")
	},900)
},900)

}
function advanceFight(currentTurnChar){
	//ok one jumbo function!
	//this will handle the fight turns I guess.
}