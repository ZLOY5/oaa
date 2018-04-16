"use strict";

var connectors = $.GetContextPanel().FindChildTraverse("ItemCombines").FindChildTraverse("ConnectorsContainer")
var items = $.GetContextPanel().FindChildTraverse("ItemCombines").FindChildTraverse("ItemsContainer")

var combinesCurrentItem = ""

items.RemoveAndDeleteChildren()
connectors.RemoveAndDeleteChildren()

function BuildItem(itemName) {

	if (itemName == combinesCurrentItem)
		return 

	CleanCombines()

	combinesCurrentItem = itemName

	var entry = GetItemEntry(itemName)

	var bHasReq = false
	var bHasPart = entry.partOf.length > 0 && entry.partOf[0] != itemName

	//$.Msg(entry.partOf)

	if (entry.Requirements != undefined)
		bHasReq = true

	var mainItem = CreateShopItem(itemName,items)
	
	var offset = 20
	var posMainY = items.desiredlayoutheight/2 - 2 
	var posMainX = 320/2 - offset

	var posPartY = posMainY - offset
	var posReqY = posMainY + offset

	if (bHasReq && bHasPart) {
		posPartY = posMainY - 30
		posReqY = posMainY + 30
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

		if (entry.partOf[i] == itemName)
			continue 

		var item = CreateShopItem(entry.partOf[i], items)
		
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

			var item = CreateShopItem(list[i], items)
			item.requirement = true

			// positioning
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
}
  
function AddConnector(from, to) {
	var connector = $.CreatePanel("Panel", connectors, "")
	
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

function CleanCombines() {
	var childs = items.Children()
	try {
		for (var item of childs) {
		
			item.AddClass("Destroying")
			item.DeleteAsync(0.2)

			if (item.connector != undefined) {
				item.connector.AddClass("Destroying")
				item.connector.DeleteAsync(0.2)
			} 
		}
	} catch(e) {}
	combinesCurrentItem = ""
}

function UpdateCombines()
{
	var usedItems = []
	var unit = Players.GetSelectedEntities(Game.GetLocalPlayerID())[0]

	for (var item of items.Children()) {
		UpdateShopItem(item)

		if (item.requirement) {
			if (FindItemByNameInInventory(unit, item.itemname, usedItems) != -1) {
				item.AddClass("Purchased")
			}
			else {
				item.RemoveClass("Purchased")
			}
		}
	}
}
