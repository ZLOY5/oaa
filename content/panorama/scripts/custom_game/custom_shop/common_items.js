"use strict";

var commonItemContainer = $.GetContextPanel().FindChildTraverse("CommonItems").FindChildTraverse("ItemList")
var commonItems = []
var commonItemsEditMode = false

function InitCommonItems() {
	commonItemContainer.RemoveAndDeleteChildren()

	commonItems = GetDotaShopCommonItems()
	
	for (var i in commonItems) {
		var panel = CreateShopItem(commonItems[i], commonItemContainer)
		panel.commonItem = true
		panel.commonSlot = i
	}
}

function ToggleEditCommonItemsMode() {
	commonItemsEditMode = !commonItemsEditMode
	$.GetContextPanel().FindChildTraverse("CommonItems").SetHasClass("EditCommonItemsMode", commonItemsEditMode)
}

function GetDotaShopCommonItems() {
	var list = []

	var itemListPanel = FindDotaHudElement("shop").FindChildTraverse("Main").FindChildTraverse("CommonItems").FindChildTraverse("ItemList")
	var childs = itemListPanel.Children()

	for (var i in childs) {
		var itemName = childs[i].FindChild("ItemImage").itemname
		list.push(itemName)
	}

	return list
}

function SetDotaShopCommonItems(list) {
	var strCommon = list.join(" ")
	GameEvents.SendEventClientSide("custom_shop_common_items", { common_items: strCommon })
}

function UpdateCommonItems() {
	var childs = commonItemContainer.Children()
	for (var i in childs) {
		UpdateShopItem(childs[i])
	}
}