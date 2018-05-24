"use strict";

var combinesConnectors = $.GetContextPanel().FindChildTraverse("ItemCombines").FindChildTraverse("ConnectorsContainer")
var combinesItems = $.GetContextPanel().FindChildTraverse("ItemCombines").FindChildTraverse("ItemsContainer")

var combinesCurrentItem = ""

combinesItems.RemoveAndDeleteChildren()
combinesConnectors.RemoveAndDeleteChildren()

function GetOrCreateShopItem(itemName) {
	var childs = combinesItems.Children()

	for (var panel of childs) {
		if ( panel.itemname == itemName && !panel.combinesUsed) {
			panel.combinesUsed = true
			panel.requirement = null
			panel.RemoveClass("Purchased")
			return panel
		}
	}

	var panel = CreateShopItem(itemName, combinesItems)
	panel.combinesUsed = true

	return panel
} 

function ClearUsedCombines() {
	var childs = combinesItems.Children()

	for (var panel of childs) {
		panel.combinesUsed = false
	}
}


function CombinesBuildItem(itemName) {

	if (itemName == combinesCurrentItem)
		return 

	ClearUsedCombines()

	combinesCurrentItem = itemName

	var entry = GetItemEntry(itemName)

	var bHasReq = entry.Requirements != undefined && entry.Requirements.length > 0
	var bHasPart = entry.partOf.length > 0 
	/*entry.partOf.indexOf(itemName) == -1 ? entry.partOf.length > 0 : entry.partOf.length > 1*/ 

	//$.Msg(entry.partOf)

	var mainItem = GetOrCreateShopItem(itemName)
	if (mainItem.connector != undefined) {
		mainItem.connector.DeleteAsync(0)
		mainItem.connector = null
	}
	
	var offset = 20
	var posMainY = combinesItems.desiredlayoutheight/2 - 2 
	var posMainX = 320/2 - offset

	var posPartY = posMainY - offset
	var posReqY = posMainY + offset

	if (bHasReq && bHasPart) {
		posPartY = posMainY - 30
		posReqY = posMainY + 32
	}
	else if (bHasReq) {
		posMainY = posMainY - offset

	}
	else if (bHasPart) {
		posMainY = posMainY + offset
	}

	mainItem.y = posMainY
	mainItem.x = posMainX
	mainItem.style.y = posMainY+"px;"
	mainItem.style.x = posMainX+"px;"
	
	mainItem.AddClass("Combine")
	mainItem.AddClass("Visible")

	
	var count = entry.partOf.length
	for (var i = 0; i < count; i++) {

		/*if (entry.partOf[i] == itemName)
			continue */

		var item = GetOrCreateShopItem(entry.partOf[i])
		
		var posPartX
		if (count == 1)
			posPartX = posMainX
		else if (count == 2)
			posPartX = 60 + 320/count*i
		else
			posPartX = 300/count/count + 320/count*i

		item.y = posPartY
		item.x = posPartX
		item.style.y = posPartY+"px;"
		item.style.x = posPartX+"px;"
		
		item.AddClass("Combine")
		item.AddClass("Visible")

		item.connector = AddConnector(item, mainItem)
	}

	if (bHasReq) {
		var list = entry.Requirements[0].slice()

		var recipe = itemName.replace("item_", "item_recipe_")
		if ( GetItemGoldCost(recipe) > 0 ) {
			list.push(recipe)
		}

		var count = list.length

		for (var i = 0; i < count; i++) {

			if (list[i] == itemName)
				continue 

			var item = GetOrCreateShopItem(list[i])
			item.requirement = true

			var posReqX 
			if (count == 1)
				posReqX = posMainX
			else if (count == 2)
				posReqX = 60 + 320/count*i
			else
				posReqX = 300/count/count + 320/count*i

			item.y = posReqY
			item.x = posReqX
			item.style.y = posReqY+"px;"
			item.style.x = posReqX+"px;"
			
			item.AddClass("Combine")
			item.AddClass("Visible")

			item.connector = AddConnector(item, mainItem)
		}

	}

	CleanCombines(false)
	UpdateCombines()
} 
  
function AddConnector(from, to) {
	var connector

	if (from.connector != undefined) {
		connector = from.connector
	}
	else if (to.connector != undefined) {
		connector = to.connector
		to.connector = null
	}
	else {
		connector = $.CreatePanel("Panel", combinesConnectors, "")
	}
	
	connector.style.width = Distance(from.x, from.y, to.x, to.y)+"px;"

	connector.style.x = (from.x+20)+"px;"
	connector.style.y = (from.y+14)+"px;"

	connector.style.transform = "rotateZ("+Angle(from.x, from.y, to.x, to.y)+"deg);"

	//$.Msg(from.style.position)

	connector.AddClass("Connector")
	connector.AddClass("Visible")

	return connector
}

function Distance(x1, y1, x2, y2) {
	return Math.sqrt( (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) )
}

function Angle(x1, y1, x2, y2) {
	return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
}

function CleanCombines(bAll) {
	var childs = combinesItems.Children()
	try {
		for (var item of childs) {
			if (bAll || !item.combinesUsed) {
				item.AddClass("Destroying")
				item.DeleteAsync(0.2)

				if (item.connector != undefined) {
					item.connector.AddClass("Destroying")
					item.connector.DeleteAsync(0.2)
				} 
			}
		}
	} catch(e) {}
	combinesCurrentItem = ""
}

function UpdateCombines()
{
	var usedItems = []
	var unit = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var courier = FindTeamCourier( Entities.GetTeamNumber(unit) )

	for (var item of combinesItems.Children()) {
		UpdateShopItem(item)

		if (item.requirement) {
			if (FindItemByNameInInventory(unit, item.itemname, usedItems) != -1
				|| FindItemByNameInInventory(courier, item.itemname, usedItems) != -1)
			{
				item.AddClass("Purchased")
			}
			else {
				item.RemoveClass("Purchased")
			}
		}
	}
}
