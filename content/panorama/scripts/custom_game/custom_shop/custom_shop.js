"use strict";

var PlayerTables = GameUI.CustomUIConfig().PlayerTables


var shopList = [];
var openedShop = "";
var popular = null;
var shopBits = null;


function CreateShopItem(itemName, parentPanel) {
	var item = $.CreatePanel("Button", parentPanel, itemName)
	item.BLoadLayoutSnippet("ShopItem");
	
	item.itemname = itemName
	item.FindChild("ItemImage").itemname = itemName
	
	item.SetPanelEvent("onmouseover", function() { 
		$.DispatchEvent("DOTAShowAbilityShopItemTooltip", item, item.itemname, "", Players.GetLocalPlayerPortraitUnit()) 

		if (item.BHasClass("Combine") || item.commonItem)
			Hilight(item.itemname)
	})

	item.SetPanelEvent("onmouseout", function() { 
		$.DispatchEvent("DOTAHideAbilityTooltip", item) 

		if (item.BHasClass("Combine") || item.commonItem)
			Unhilight(item.itemname)
	})

	item.SetPanelEvent("oncontextmenu", function() { 
		BuyRequest(item.itemname)
	})

	item.SetPanelEvent("onactivate", function() { 
		BuildItem(item.itemname)
	})

	item.SetDraggable(true)
	
	$.RegisterEventHandler("DragStart", item, function(panel, dragCallbacks) {
		item.AddClass("DraggedShopItem")
		$.DispatchEvent("DOTAHideAbilityTooltip", item)

		var displayPanel = $.CreatePanel( "DOTAItemImage", $.GetContextPanel(), "dragImage" )
        displayPanel.itemname = item.itemname
        displayPanel.customShopItem = true

		dragCallbacks.displayPanel = displayPanel;
        dragCallbacks.offsetX = 0;
        dragCallbacks.offsetY = 0;
	})

	$.RegisterEventHandler("DragEnter", item, function(panel, dragCallbacks) {
		if (commonItemsEditMode && item.commonItem) {
			item.AddClass("EditModeDestination")
		}
	})

	$.RegisterEventHandler("DragLeave", item, function(panel, dragCallbacks) {
		if (commonItemsEditMode && item.commonItem) {
			item.RemoveClass("EditModeDestination")
		}
	})


	$.RegisterEventHandler("DragDrop", item, function(panel, draggedPanel) {
		if (commonItemsEditMode && item.commonItem) {

			item.itemname = draggedPanel.itemname
			item.FindChild("ItemImage").itemname = draggedPanel.itemname

			commonItems[item.commonSlot] = item.itemname
			SetDotaShopCommonItems(commonItems)
		}

	})
	
	$.RegisterEventHandler("DragEnd", item, function(panelID, draggedPanel) {
		item.RemoveClass("DraggedShopItem")
		draggedPanel.DeleteAsync(0)
	})

    UpdateShopItem(item)

	return item
} 

function Hilight(itemName) {
	var shop = $.GetContextPanel().FindChildTraverse("GridShop"+openedShop)

	if (shop == null) 
		return

	var page = shop.FindChildTraverse(shop.openedPage)
	
	if (page == null) 
		return

	var item = page.items[itemName]

	if (item != undefined) {
		item.AddClass("Hilighted")
	}
}

function Unhilight(itemName) {
	var shop = $.GetContextPanel().FindChildTraverse("GridShop"+openedShop)

	if (shop == null) 
		return

	var page = shop.FindChildTraverse(shop.openedPage)
	
	if (page == null) 
		return

	var item = page.items[itemName]

	if (item != undefined) {
		item.RemoveClass("Hilighted")
	}


}

function UpdateShopItem(panel) {
	var itemName = panel.itemname
	var entry = GetItemEntry(itemName)

	if (entry == undefined)
		return
	
	var team = Players.GetTeam(Game.GetLocalPlayerID())

	var canPurchase = HasEnoughGoldForItem(itemName) && !IsItemOutOfStock(itemName)
	panel.SetHasClass("CanPurchase", canPurchase)

	if (entry.StockCount != undefined) {
		if (entry.StockCount[team] >= 1) {
			panel.SetHasClass("ShowStockAmount", true)
			panel.SetHasClass("OutOfStock", false)
		}
		else {
			panel.SetHasClass("ShowStockAmount", false)
			panel.SetHasClass("OutOfStock", true)

			var time = entry.StockIncrementTime[team] - Game.GetGameTime()

			if (time < 0)
				time = 0

			var stockTime = entry.StockTime

			if ( entry.Initial == 1 && entry.InitialStockTime != undefined )
				stockTime = entry.InitialStockTime

			var deg = - ( time / stockTime ) * 360

			if (!isNaN(deg))
				panel.FindChild("OutOfStockOverlay").style.clip = "radial( 50% 50%, 0deg, "+deg+"deg );" //
		}

		panel.FindChild("StockAmount").text = entry.StockCount[team]
	}

	if (popular != null) {
		panel.SetHasClass("Popular", popular[itemName] == 1)
	}
}

function BuyRequest(itemName) {

	if (!IsValidItemName(itemName))
		return

	var plID = Game.GetLocalPlayerID()
	var unit = Players.GetLocalPlayerPortraitUnit()

	if (Game.IsGamePaused()) {
		GameEvents.SendEventClientSide('dota_hud_error_message', { reason: 94})
		return
	}
	
	
	if (Entities.GetPlayerOwnerID(unit) != plID) {
		unit = Players.GetSelectedEntities(plID)[0]
	}

	if (!Entities.IsInventoryEnabled(unit)) {
		GameEvents.SendEventClientSide('dota_hud_error_message', { reason: 39})
		return
	}



	
	/*
	var inRangeOfAny = Entities.GetCustomShopMask(unit) != 0
	var inRangeOfHome = Entities.IsInRangeOfCustomShop(unit, shopBits.CUSTOM_SHOP_Home)
	var inRangeOfAnyButNotHome = inRangeOfAny && !inRangeOfHome

	//is unit in range of shop that can sold this item
	if ( Entities.IsInRangeOfCustomShop(unit, GetItemAvailability(itemName)) ) {
 		 if ( inRangeOfAnyButNotHome ) {
			
			var inventoryFull = Entities.GetNumItemsInInventory(unit) == 9
			
			var item = FindItemByNameInInventory(unit, itemName)
			var IsStackable = (item != -1) ? Items.IsStackable(item) : false

			if (inventoryFull && !IsStackable) { 
				GameEvents.SendEventClientSide('dota_hud_error_message', { reason: 80, message: "#dota_hud_error_cant_purchase_inventory_full"})
				return
			}
		}
	}
	//try buy item to stash
	else if ( IsItemAvailable(itemName, shopBits.CUSTOM_SHOP_Home) ) {

	}*/

	
	var list = GetItemListToCombineItem(itemName)
	$.Msg(list)

	if (!HasEnoughGoldForItem(itemName)) {
		GameEvents.SendEventClientSide('dota_hud_error_message', { reason: 63}) //need more gold
		return
	}

	if (HasItemListUnpurchasableItems(list)) {
		GameEvents.SendEventClientSide('dota_hud_error_message', { reason: 82}) // out of stock
		return 
	}



	for (var i in list) {	
		var itemID = GetItemID(list[i])
		Game.PurchaseItem( unit, itemID, false)
		//GameEvents.SendCustomGameEventToServer("custom_shop_buy", {itemName: list[i], unit: portraitUnit })	
	}

	if (combinesCurrentItem == itemName) 
		CleanCombines()

	Game.EmitSound("General.Buy")
}

function AddPopularButton(shop) {
	var popular = $.CreatePanel("Button", shop, "PopularItems")
	$.CreatePanel("Panel", popular, "PopularItemsIcon")

	popular.SetPanelEvent("onactivate", function() { shop.ToggleClass("ShowPopular")})

	popular.SetPanelEvent("ommouseover", function() { 
		$.DispatchEvent("UIShowTextTooltip", popular, "#DOTA_Shop_Tip_RequestSuggestion")
	})

	popular.SetPanelEvent("ommouseout", function() { 
		$.DispatchEvent("UIHideTextTooltip", popular)
	})
}

function ConstructShop(shopName, schema) {
	var shop = $.CreatePanel("Panel", $.GetContextPanel().FindChildTraverse("HeightLimiter"), "GridShop"+shopName)
	shop.AddClass("GridShop")

	shop.AddClass("ShowPopular")
	shop.AddClass("ShowHilight")

	var itemGrid = $.CreatePanel("Panel", shop, "GridItems")

	shop.pageList = [] //page names of this shop


	for ( var pageName in schema) {
		var page = $.CreatePanel("Panel", itemGrid, pageName)
		page.AddClass("ShopItemsColumns")

		page.items = {}
		
		shop.pageList.push(pageName)

		for ( var columnNumber in schema[pageName]) {
			var column = $.CreatePanel("Panel", page, columnNumber)
			column.AddClass("ShopItemsColumn")

			var columnSchema = schema[pageName][columnNumber]

			for (var i in columnSchema) {
				page.items[columnSchema[i]] = CreateShopItem(columnSchema[i], column)
			}
		}
	}

	if (shop.pageList.length > 1) {
		shop.AddClass("SeveralPages")

		shop.pageList.sort()
		
		var tabPicker = $.CreatePanel("DropDown", shop, "TabPicker")
		for (var i in shop.pageList) {
			var pageName = shop.pageList[i]
			var option = $.CreatePanel("Label", tabPicker, pageName)
			option.text = $.Localize(pageName)

			tabPicker.AddOption(option)

			tabPicker.SetPanelEvent("oninputsubmit", function() {
				SetOpenedPage(tabPicker.GetSelected().id)
			})

		}

		tabPicker.SetSelected(shop.pageList[0])
		shop.openedPage = shop.pageList[0]

		AddPopularButton(shop)
	}
}

function SetOpenedShop(shopName) {
	openedShop = shopName;
	for (var i = 0; i < shopList.length; i++) {
		var shop = $.GetContextPanel().FindChildTraverse("GridShop"+shopList[i])

		if (shop == null) 
			return
		
		shop.SetHasClass("Hidden", shopList[i] != shopName)
	}
}

function SetOpenedPage(pageName) {
	var shop = $.GetContextPanel().FindChildTraverse("GridShop"+openedShop)
	
	if (shop == null) 
		return

	shop.openedPage = pageName

	if (shop.pageList.length > 1) {
		for (var i in shop.pageList) {
			var name = shop.pageList[i]
			shop.FindChildTraverse(name).SetHasClass("Hidden", name != pageName)
		}
	}
} 

function UpdateShop() {
	var shop = $.GetContextPanel().FindChildTraverse("GridShop"+openedShop)

	if (shop == null) 
		return

	var page = shop.FindChildTraverse(shop.openedPage)
	
	if (page == null) 
		return

	for (var i in page.items) {
		UpdateShopItem(page.items[i])
	}

	UpdateCombines()
	UpdateCommonItems()
}


function OnHeroPick(data) {
	var heroName =  Players.GetPlayerSelectedHero(Game.GetLocalPlayerID())
	if (heroName != "") {
		var table = CustomNetTables.GetTableValue("custom_shop", "popular_items"+heroName)
		if (table != undefined) {
			popular = table
		}
	}
}

(function()
{
	GameEvents.Subscribe("dota_player_pick_hero", OnHeroPick)
	GameEvents.Subscribe("dota_inventory_changed", UpdateShop)

	var schema = CustomNetTables.GetTableValue("custom_shop", "schema")

	shopBits = CustomNetTables.GetTableValue("custom_shop", "shop_bits")

	if (typeof(schema) != "undefined") {
		for ( var shopName in schema) {
			shopList.push(shopName)
			ConstructShop(shopName, schema[shopName])	
		}
	}

	SetOpenedShop("Home") 
	SetOpenedPage("Basic")  

	OnHeroPick()

	var func = function() {
		$.Schedule(0.1, func)	
		UpdateShop()
	}

	func()

	InitCommonItems()

})();
 
 
Game.PurchaseItem = function(ent, itemid, queue) {
	var order = {}
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_PURCHASE_ITEM
	order.UnitIndex = ent
	order.AbilityIndex = itemid
	order.Queue = queue
	order.ShowEffects = false
	Game.PrepareUnitOrders(order)
}

Entities.IsInRangeOfCustomShop = function(entID, shopMask) {
	return (Entities.GetCustomShopMask(entID) & shopMask) != 0
}

Entities.GetCustomShopMask = function(entID) {
	var buff = Entities.FindModifier(entID, "modifier_custom_shop")
	
	if (buff != -1)
		return Buffs.GetStackCount( entID, buff);

	return 0 
}

Entities.FindModifier = function(entID, modifierName) {
	var buffs = Entities.GetNumBuffs(entID)

	for (var i = 0; i <= buffs; i++) {
		var buff = Entities.GetBuff( entID, i)
		if ( Buffs.GetName(entID, buff) == modifierName ) {
			return buff
		}
	}
	return -1
}