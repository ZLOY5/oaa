"use strict";

var seacrhItemList

var searchContainer = $.GetContextPanel().FindChildTraverse("SearchContainer")
var searchTextEntry = $.GetContextPanel().FindChildTraverse("SearchBox").FindChildTraverse("SearchTextEntry")
var searchResult = $.GetContextPanel().FindChildTraverse("SearchResults")
var searchResultContents = searchResult.FindChildTraverse("SearchResultsContents")

function GetSearchItemList() {
	var str = CustomNetTables.GetTableValue("custom_shop", "item_list1").itemList
		+ CustomNetTables.GetTableValue("custom_shop", "item_list2").itemList

	var list = JSON.parse(str)

	list = list.filter(function(element) { //filter recipes and unpurchasable items
		if (element.indexOf("recipe") != -1)
			return false

		if (element.indexOf("river") != -1) //item_river_painter,  idk what is this
			return false

		if (IsItemPurchasable(element))
			return true

		return false
	}) 

	return list
}

function SearchTextChange() {
	var text = searchTextEntry.text

	if (searchTextEntry.flag)
		return
	
	if (text == "") {
		searchResult.AddClass("Hidden")
		$.GetContextPanel().RemoveClass("ShowSearchResults")
		return
	}

	searchResult.RemoveClass("Hidden")
	$.GetContextPanel().AddClass("ShowSearchResults")


	var res = SearchItems( text.trim().toLowerCase().split(/\s+/) )

	searchResult.SetHasClass("Empty", res.length == 0)

	for (var i = 0; i < 12; i++) {
		var panel = searchResultContents.FindChild("SearchResult"+i)

		if (panel == undefined) 
			continue

		if (res[i] != undefined) {
			panel.RemoveClass("Hidden")

			panel.itemname = res[i]

			if (i == 0) {
				panel.SetFocus() //todo: focus on textentry and seachresult together like in def dota shop
				//searchContainer.SetFocus()
			}
		}
		else {
			panel.AddClass("Hidden")
		}
	}
	searchTextEntry.flag = true
	searchTextEntry.UpdateFocusInContext(panel)
	searchTextEntry.flag = false
}

function SearchItems(list) {

	var resultsByStartOfName = []
	var resultsOther = []

	for (var itemName of seacrhItemList) {
			
		var locName = LocalizeItem(itemName).toLowerCase()
		var entry = GetItemEntry(itemName)

		var shopTags = entry.ShopTags
		var aliases = entry.Aliases

		var count = 0
		var startOfName = false

		for (var s of list) {
			var index = locName.indexOf(s)

			if (index == 0) {
				count++
				startOfName = true
			}
			else if (aliases != undefined && aliases.indexOf(s) != -1) {
					count++
			}
			else if (shopTags != undefined && shopTags.indexOf(s) != -1) {
					count++
			} 
			else if (index > 0) {
				count++
			}

		}

		if (count >= list.length) { //item meets all conditions
			if ( startOfName ) {
				resultsByStartOfName.push(itemName)
			}
			else {
				resultsOther.push(itemName)
			}
		}
	}

	SortItemListByGoldCost(resultsByStartOfName)
	SortItemListByGoldCost(resultsOther)

	var result = resultsByStartOfName.concat(resultsOther)
	//$.Msg(result)
	return unique(result).splice(0,12) 
}

function unique(arr) {
	var obj = {};

	for (var i = 0; i < arr.length; i++) {
		var str = arr[i];
		obj[str] = true; 
	}

	return Object.keys(obj);
}


function LocalizeItem(itemName) {
	var str = "DOTA_Tooltip_Ability_"+itemName
	var loc = $.Localize(str)

	if (loc == str)
		return ""

	return loc
}

function SortItemListByGoldCost(list) {
	list.sort(function(a,b) {
		var aCost = GetItemGoldCost(a) 
		var bCost = GetItemGoldCost(b) 

		if (aCost < bCost)
			return -1

		if (aCost > bCost)
			return 1

		return 0
	})
}

function HideSearch() {
	$.DispatchEvent("DropInputFocus", searchTextEntry)
	$.GetContextPanel().RemoveClass("ShowSearchResults")
	searchResult.AddClass("Hidden")
}

function InitSearch() {
	searchResult.AddClass("Hidden")
	$.GetContextPanel().RemoveClass("ShowSearchResults")

	for (var i = 0; i < 12; i++) {
		CreateSearchResult(i)
	}

	seacrhItemList = GetSearchItemList()

	searchTextEntry.SetPanelEvent("ontextentrychange", SearchTextChange)
	searchTextEntry.SetPanelEvent("onfocus", SearchTextChange)
	//searchTextEntry.SetPanelEvent("onblur", function() {
	//	$.GetContextPanel().RemoveClass("ShowSearchResults")
	//	searchResult.AddClass("Hidden")
	//})
}

function CreateSearchResult(number) {
	var panel = $.CreatePanel("Button", searchResultContents, "SearchResult"+number)
	panel.BLoadLayoutFromString('<root><Button selectionpos="auto"/></root>', true, true)
	panel.AddClass("SearchResult")
	panel.AddClass("Hidden") 

	panel.SetAcceptsFocus(false)
	panel.inputnamespace = "custom_shop_search"

	var shopitem = CreateShopItem("item_branches", panel, "ShopItem")
	shopitem.hittest = false

	var namePanel = $.CreatePanel("Label", panel, "ItemName")
	namePanel.hittest = false

	var costPanel = $.CreatePanel("Label", panel, "ItemCost")
	costPanel.hittest = false

	Object.defineProperty(panel, "itemname", {

		set: function(value) {
			this.itemName = value
			
			shopitem.itemname = value
			shopitem.FindChild("ItemImage").itemname = value

			UpdateShopItem(shopitem)

			namePanel.text = LocalizeItem(value)

			costPanel.text = GetItemGoldCost(value)
		}
	});

	panel.SetPanelEvent("onmouseover", function() { 
		if (panel.itemName == "")
			return 
		
		$.DispatchEvent("DOTAShowAbilityShopItemTooltip", panel, panel.itemName, "", Players.GetLocalPlayerPortraitUnit()) 

	})

	panel.SetPanelEvent("onmouseout", function() { 
		$.DispatchEvent("DOTAHideAbilityTooltip", panel) 
	})

	panel.SetPanelEvent("oncontextmenu", function() { 
		BuyRequest(panel.itemName)
	})

	panel.SetPanelEvent("onfocus", function() { 
		CombinesBuildItem(panel.itemName)
	})

	panel.SetDraggable(true)
	
	$.RegisterEventHandler("DragStart", panel, function(panel, dragCallbacks) {
		panel.AddClass("DraggedShopItem")
		$.DispatchEvent("DOTAHideAbilityTooltip", panel)

		var displayPanel = $.CreatePanel( "DOTAItemImage", $.GetContextPanel(), "dragImage" )
		displayPanel.itemname = panel.itemName
		displayPanel.customShopItem = true

		dragCallbacks.displayPanel = displayPanel;
		dragCallbacks.offsetX = 0;
		dragCallbacks.offsetY = 0;
	})


	$.RegisterEventHandler("DragEnd", panel, function(panelID, draggedPanel) {
		panel.RemoveClass("DraggedShopItem")
		draggedPanel.DeleteAsync(0)
	})

}

InitSearch()