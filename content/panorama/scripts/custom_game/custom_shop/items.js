"use strict";

var itemEntries = {};

function ProcessItemEntry(itemName) {
	var entry = CustomNetTables.GetTableValue("custom_shop", "entry_"+itemName)
	
	if (entry == undefined) {
		$.Msg("[Custom shop] ProcessItemEntry: Unknown item name "+itemName)
		return
	}
	
	if (entry.Requirements != null) {
		entry.Requirements = LuaTableToArray(entry.Requirements)

		for (var i in entry.Requirements) {
			entry.Requirements[i] = LuaTableToArray(entry.Requirements[i])
		}

		
	}

	entry.partOf = LuaTableToArray(entry.partOf)
	entry.partOf.sort()

	itemEntries[itemName] = entry

	var list = GetItemListToCombineItem(itemName)
	entry.GoldCost = GetGoldCostOfItemList(list)

	//UpdateShopItemsWithName(itemName)
}


function GetItemEntry(itemName) {
	if (itemEntries[itemName] == null)
		ProcessItemEntry(itemName)

	return itemEntries[itemName]
}

function IsValidItemName(itemName) {
	return GetItemEntry(itemName) != undefined
}

function GetItemID(itemName) {
	var entry = GetItemEntry(itemName)

	if (entry == undefined) 
		return -1

	return entry.ItemID
}

function IsItemPurchasable(itemName) {
	var entry = GetItemEntry(itemName)

	if (entry == undefined) 
		return false

	return (entry.IsPurchasable == 1)
}

function GetItemAvailability(itemName) {
	var entry = GetItemEntry(itemName)

	if (entry == undefined) 
		return 0

	return entry.ShopAvailability
}

function IsItemAvailable(itemName, shopMask) {
	var entry = GetItemEntry(itemName)

	if (entry == undefined) 
		return false

	return (entry.ShopAvailability & shopMask) != 0
}

function IsItemSimple(itemName) {
	var entry = GetItemEntry(itemName)

	return entry.Requirements == null
}


function GetItemGoldCost(itemName) {
	var entry = GetItemEntry(itemName)
	
	return entry.GoldCost
}

function GetGoldCostOfItemList(list) {
	var gold = 0

	for (var i in list) {
		gold = gold + GetItemGoldCost(list[i])
	}

	return gold 
}

function IsItemHasStockCount(itemName) {
	var entry = GetItemEntry(itemName)

	if (entry == undefined) 
		return false

	return entry.StockCount != undefined
}

function IsItemOutOfStock(itemName) {
	var entry = GetItemEntry(itemName)

	if (entry == undefined) 
		return true

	var team = Players.GetTeam(Game.GetLocalPlayerID())

	if (entry.StockCount != undefined)
		return entry.StockCount[team] == 0

	return false
}
 
// return array with names of items that requires to buy for itemName
function GetItemListToCombineItem(itemName, unit, variant, usedItems) {
	var entry = GetItemEntry(itemName)
	var list = []

	if (entry.Requirements == null) { //simple item without recipe
		list.push(itemName) 
		return list
	}

	//$.Msg(itemName)

	if (entry.Requirements[variant] == null)
		variant = 0

	if (usedItems == null)
		usedItems = []

	//var unit = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())

	var variantArr = entry.Requirements[variant]
	
	for (var i in variantArr) { 
		var item = variantArr[i]
		
		var inventoryItemID = FindItemByNameInInventory(unit, item, usedItems)
		if (inventoryItemID != -1) //if unit already has this item
			continue
		else if ( IsItemSimple(item) ) //just add item to list if it simple
			list.push(item)
		else 
			list.push.apply( list, GetItemListToCombineItem( item, unit , 0, usedItems) )
	}

	var recipe = itemName.replace("item_", "item_recipe_")
	
	if ( GetItemGoldCost(recipe) > 0 && FindItemByNameInInventory(unit, recipe, usedItems) == -1) {
		list.push(recipe)
	}

	return list

}


function HasItemListUnpurchasableItems(list) {
	for (var i in list) {
		if (!IsItemPurchasable(list[i]))
			return true

		if (IsItemOutOfStock(list[i]))
			return true
	}

	return false
}

function HasEnoughGoldForItem(itemName) {
	var unit = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())

	var itemList = GetItemListToCombineItem(itemName, unit)
	
	var goldCost = GetGoldCostOfItemList(itemList)
	var bEnoughGold = (Players.GetGold(Game.GetLocalPlayerID()) >= goldCost)

	return bEnoughGold
}

function FindItemByNameInInventory(entIndex, itemName, ignoreList) {
	
	//if ( !Entities.HasItemInInventory(entIndex, itemName) ) --does not check stash slots
	//	return -1
	if (entIndex == undefined || !Entities.IsValidEntity(entIndex))
		return -1

	if (ignoreList == null)
		ignoreList = []

	for (var slot = 0; slot < 15; slot++) {
		var item = Entities.GetItemInSlot(entIndex, slot)
		
		//$.Msg(slot,item)
		
		if ( (Abilities.GetAbilityName(item) == itemName) && (ignoreList.indexOf(item) == -1) ) {
			ignoreList.push(item)
			return item
		}
	}

	return -1
}
