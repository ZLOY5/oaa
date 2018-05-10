"use strict";

var quickBuyItem = "";
var stickyItem = "";

var quickBuyPanel = $.GetContextPanel().FindChildTraverse("quickbuy")

function GetDotaShopStickyItem() {
	return FindDotaHudElement("lower_hud")
		.FindChildTraverse("shop_launcher_block")
		.FindChildTraverse("QuickBuyRows")
		.FindChildTraverse("QuickBuySlot8").FindChild("ItemImage").itemname

}

function InitQuickBuy() {
	var row0 = quickBuyPanel.FindChildTraverse("Row0")
	var row1 = quickBuyPanel.FindChildTraverse("Row1")
	var stickyContainer = quickBuyPanel.FindChildTraverse("StickyItemSlotContainer")

	row0.RemoveAndDeleteChildren()
	row1.RemoveAndDeleteChildren()
	stickyContainer.RemoveAndDeleteChildren()

	row0.AddClass("Empty")
	row1.AddClass("Empty")

	CreateShopItem("item_branches", row0, "QuickBuySlot0").AddClass("Hidden")
	CreateShopItem("item_branches", row0, "QuickBuySlot1").AddClass("Hidden")
	CreateShopItem("item_branches", row0, "QuickBuySlot2").AddClass("Hidden")
	CreateShopItem("item_branches", row0, "QuickBuySlot3").AddClass("Hidden")

	CreateShopItem("item_branches", row1, "QuickBuySlot4").AddClass("Hidden")
	CreateShopItem("item_branches", row1, "QuickBuySlot5").AddClass("Hidden")
	CreateShopItem("item_branches", row1, "QuickBuySlot6").AddClass("Hidden")
	CreateShopItem("item_branches", row1, "QuickBuySlot7").AddClass("Hidden")

	stickyItem = GetDotaShopStickyItem()
	var sticky = CreateShopItem(stickyItem, stickyContainer, "QuickBuySlot8")
	sticky.stickyItem = true

	quickBuyPanel.AddClass("ShowHint")

	GameEvents.Subscribe("dota_inventory_changed", function() {
		if ( IsValidItemName(quickBuyItem) )
			SetQuickBuyItem(quickBuyItem)
	})

	//SetQuickBuyItem("item_dagon")

	var shopLauncher = $.GetContextPanel().FindChildTraverse("shop_launcher_block")
	shopLauncher.SetDraggable(true)
	
	$.RegisterEventHandler("DragDrop", quickBuyPanel, function(panel, draggedPanel) { 
		if ( IsValidItemName(draggedPanel.itemname) && !draggedPanel.stickyDropped ) 
			SetQuickBuyItem(draggedPanel.itemname)
	})

	$.GetContextPanel().FindChildTraverse("stash").AddClass("QuickBuyRows0")
}

function UpdateQuickBuy() {
	for (var i = 0; i <= 8; i++) {
		UpdateShopItem( quickBuyPanel.FindChildTraverse("QuickBuySlot"+i) )
	}
}

function ClearQuickBuy() {
	quickBuyItem = ""

	quickBuyPanel.AddClass("ShowHint")

	var stash = $.GetContextPanel().FindChildTraverse("stash")
	stash.SetHasClass("QuickBuyRows0", true)
	stash.SetHasClass("QuickBuyRows1", false)
	stash.SetHasClass("QuickBuyRows2", false)

	$.GetContextPanel().FindChildTraverse("CustomShop").SetHasClass("QuickBuyRows2", false)
}

function SetQuickBuyItem(itemName) {
	if (!IsValidItemName(itemName)) {
		$.Msg("SetQuickBuyItem: Invalid item name "+itemName)
		return
	}

	quickBuyItem = itemName
	quickBuyPanel.RemoveClass("ShowHint")

	var list = GetItemListToCombineItem(itemName, Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()) ) 

	for (var i = 0; i < 8; i++) {
		var item = list[i]
		var slot = quickBuyPanel.FindChildTraverse("QuickBuySlot"+i)

		if (item != undefined) {
			slot.itemname = item
			slot.FindChild("ItemImage").itemname = item
			
			slot.RemoveClass("Hidden")
		}
		else {
			slot.AddClass("Hidden")
		}
	}

	var row0 = quickBuyPanel.FindChildTraverse("Row0")
	var row1 = quickBuyPanel.FindChildTraverse("Row1")
	
	var len = list.length 
	row0.SetHasClass("Empty", len == 0)
	row1.SetHasClass("Empty", len <= 4)

	var stash = $.GetContextPanel().FindChildTraverse("stash")
	stash.SetHasClass("QuickBuyRows0", len == 0)
	stash.SetHasClass("QuickBuyRows1", len > 0 && len <= 4)
	stash.SetHasClass("QuickBuyRows2", len > 4)

	$.GetContextPanel().FindChildTraverse("CustomShop").SetHasClass("QuickBuyRows2", len > 4)

	UpdateQuickBuy()
}

function SetStickyItem(itemName) {
	stickyItem = itemName

	var sticky = quickBuyPanel.FindChildTraverse("QuickBuySlot8")

	sticky.itemname = itemName
	sticky.FindChild("ItemImage").itemname = itemName 

	GameEvents.SendEventClientSide("custom_shop_sticky_item", { sticky_item: itemName })

	//$.Msg(sticky)
}