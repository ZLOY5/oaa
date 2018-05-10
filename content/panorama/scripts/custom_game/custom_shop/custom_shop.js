"use strict";

var PlayerTables = GameUI.CustomUIConfig().PlayerTables

var shopEntities = [];
var shopList = [];
var openedShop = "";
var popular = null;
var shopBits = null;
var shopItems = {};
var shopOpen = false;


function CreateShopItem(itemName, parentPanel, id) {
	
	if (id == undefined)
		id = itemName

	var item = $.CreatePanel("Button", parentPanel, id)
	item.BLoadLayoutSnippet("ShopItem");
	
	item.itemname = itemName
	item.FindChild("ItemImage").itemname = itemName
	
	item.SetPanelEvent("onmouseover", function() { 
		if (item.itemname == "")
			return 
		
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
		HideSearch()
		CombinesBuildItem(item.itemname)
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

		$.GetContextPanel().FindChildTraverse("quickbuy").AddClass("potential_drop_target")
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


		if ( item.stickyItem ) {
			SetStickyItem(draggedPanel.itemname)
			draggedPanel.stickyDropped = true
		}

	})
	
	$.RegisterEventHandler("DragEnd", item, function(panelID, draggedPanel) {
		item.RemoveClass("DraggedShopItem")
		draggedPanel.DeleteAsync(0)

		$.GetContextPanel().FindChildTraverse("quickbuy").RemoveClass("potential_drop_target")
	})

	UpdateShopItem(item)

	if (shopItems[itemName] == undefined)
		shopItems[itemName] = []

	shopItems[itemName].push(item)

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

	if (itemName == "")
		return

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

		if (panel.stockUpdateSchedule == undefined) {
			panel.stockUpdateSchedule = $.Schedule(0, function() {
				panel.stockUpdateSchedule = null
				UpdateShopItem(panel)
			})
		}

		panel.FindChild("StockAmount").text = entry.StockCount[team]
	}
	else {
		if (panel.stockUpdateSchedule != undefined) {
			$.CancelScheduled(panel.stockUpdateSchedule)
			panel.stockUpdateSchedule = null
		}

		panel.SetHasClass("ShowStockAmount", false)
		panel.SetHasClass("OutOfStock", false)
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

	
	var list = GetItemListToCombineItem(itemName, unit)
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
		CleanCombines(true)

	if (quickBuyItem == itemName)
		ClearQuickBuy()

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
		
		var tabPicker = $.CreatePanel("Panel", shop, "TabPicker")
		
		for (var i in shop.pageList) {
			var pageName = shop.pageList[i]
			var option = $.CreatePanel("RadioButton", tabPicker, pageName)
			var label = $.CreatePanel("Label", option, "")
			label.text = $.Localize("custom_shop_page_"+pageName)

			
			option.SetPanelEvent("onactivate", function() {
				SetOpenedPage(option.GetSelectedButton().id)
			})

		}

		//tabPicker.SetSelected(shop.pageList[0])
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

	if (shop.pageList.indexOf(pageName) == -1) {
		$.Msg("[Custom shop] SetOpenedPage: Unknown page name "+pageName+" for shop "+openedShop)
		return
	}

	shop.openedPage = pageName

	if (shop.pageList.length > 1) {
		for (var i in shop.pageList) {
			var name = shop.pageList[i]
			shop.FindChildTraverse(name).SetHasClass("Hidden", name != pageName)
		}
	}
} 

function UpdateShop() {

	if (shopOpen) {
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

	UpdateQuickBuy()
}

function ToggleShopKey() {
	ToggleShop()
}

function ToggleShop(shopName) {
	if (shopOpen) 
		HideShop()
	else
		ShowShop(shopName)
}

function HideShop() {
	shopOpen = false
	$.GetContextPanel().FindChild("CustomShop").SetHasClass("ShopOpen", false)
	$.GetContextPanel().FindChild("CustomShop").SetHasClass("ShopClosing", true)

	HideSearch()
	CleanCombines(true)

	$.GetContextPanel().RemoveClass("StashVisible")

	$.GetContextPanel().FindChildTraverse("stash").RemoveClass("ShopOpen")
}

function ShowShop(shopName) {
	shopOpen = true
	$.GetContextPanel().FindChild("CustomShop").SetHasClass("ShopOpen", true)
	$.GetContextPanel().FindChild("CustomShop").SetHasClass("ShopClosing", false)

	var shopUnit = GetShopUnit()

	$.Msg(shopName)
	if (shopName == undefined) {
		if (Entities.IsInRangeOfCustomShop(shopUnit, shopBits.CUSTOM_SHOP_Side))
			shopName = "Side"
		else
			shopName = "Home"
	}

	SetOpenedShop(shopName)

	UpdateShop()

	$.GetContextPanel().AddClass("StashVisible")

	$.GetContextPanel().FindChildTraverse("stash").AddClass("ShopOpen")
}

function GetShopUnit() { //unit that currently use shop
		var unit = Players.GetLocalPlayerPortraitUnit()
		var localPlayerID = Game.GetLocalPlayerID();
		var playerID = Entities.GetPlayerOwnerID(unit);

		if ( Entities.IsCourier(unit) && ( Entities.GetTeamNumber(unit) == Players.GetTeam(localPlayerID) ) ) 
			return unit

		if ( playerID === -1 || Entities.GetTeamNumber(unit) !== Players.GetTeam(localPlayerID) ) {
			return Players.GetPlayerHeroEntityIndex(localPlayerID)
		}

		return unit
}

function GetShopKeybind() {
	return "f4"//FindDotaHudElement(DashboardCore).FindChildTraverse(cstring cstring_1)
}

function OnUnitShopMaskChanged(unit) {
	var shopUnit = GetShopUnit()

	//$.Msg( "OnUnitShopMaskChanged " + Entities.GetUnitName(shopUnit) + " " + Entities.GetCustomShopMask(shopUnit) )

	if (shopUnit == unit) {
		UpdateShopButton()
	}
}

function UpdateShopButton() {
	var shopUnit = GetShopUnit()

	var panel = $.GetContextPanel().FindChildTraverse("shop_launcher_block")
	panel.SetHasClass("ShopInRange", Entities.GetCustomShopMask(shopUnit) != 0 )

	var playerID = Entities.GetPlayerOwnerID(shopUnit)
	var data = PlayerTables.GetAllTableValues('gold')

	if (playerID == -1)
		playerID = Game.GetLocalPlayerID()

	var gold = data.gold[playerID];


	var useFormatting = 'half'; 
	var GoldLabel = panel.FindChildTraverse('GoldLabel');

	if (useFormatting === 'full') {
		GoldLabel.text = FormatGold(gold);
	} else if (useFormatting === 'half') {
		GoldLabel.text = FormatComma(gold);
	} else {
		GoldLabel.text = gold;
	}
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

function OnNetUpdate(table, key, data) {
	if (key.indexOf("entry_") != -1)
		ProcessItemEntry(key.replace("entry_",""))

	if (key.indexOf("shop_mask") != -1)
		OnUnitShopMaskChanged( Number(key.replace("shop_mask_","")) ) 
}

var previousGold = 0
function OnGoldChanged(table, data) {
	UpdateShopButton()

	var gold = data.gold[Game.GetLocalPlayerID()]
	if ( gold != previousGold ) {
		UpdateShop()
		previousGold = gold
	}
}

function OnItemCombined(event) {
	if (combinesCurrentItem == event.itemName) 
		CleanCombines(true)

	if (quickBuyItem == event.itemName)
		ClearQuickBuy()
}


function MouseFilter(eventName, arg) {
	//$.Msg(GameUI.GetClickBehaviors() ,eventName, arg)
	
	if ( GameUI.GetClickBehaviors() == CLICK_BEHAVIORS.DOTA_CLICK_BEHAVIOR_NONE 
		&& ( eventName == "pressed" || eventName == "doublepressed" )
			&& arg == 0 ) {
		
		
		var target = GetMouseTarget()
		//$.Msg(shopEntities[target])
		if ( Entities.IsShop(target) ) { //click on shopkeeper
			if (shopEntities[target] != undefined ) {
				ToggleShop(shopEntities[target])
			}
			return true  //prevent default click behavior
		}


		//hide shop when left click on ground
		HideShop()
	}

	return false
}

var GoldListener
(function()
{
	GameEvents.Subscribe("dota_player_pick_hero", OnHeroPick)
	GameEvents.Subscribe("dota_inventory_changed", UpdateShop)

	GameEvents.Subscribe('dota_player_update_query_unit', UpdateShopButton)
	GameEvents.Subscribe('dota_player_update_selected_unit', UpdateShopButton)

	CustomNetTables.SubscribeNetTableListener("custom_shop", OnNetUpdate)

	if (GoldListener == undefined) 
		GoldListener = PlayerTables.SubscribeNetTableListener('gold', OnGoldChanged)

	GameEvents.Subscribe( "local_player_item_combined", OnItemCombined)
	
	//$.RegisterForUnhandledEvent("DOTAHUDToggleShop", ToggleShop)
	//$.RegisterForUnhandledEvent("DOTAShopHideShop", HideShop)
	//$.RegisterForUnhandledEvent("DOTAShopShowShop", ShowShop)

	GameUI.SetMouseCallback( MouseFilter )

	//$.RegisterKeyBind(GetDotaHud(), "key_"+GetShopKeybind(), ToggleShop)
	Game.AddCommand( "togglecustomshop", ToggleShopKey, "", 0)
	Game.CreateCustomKeyBind( GetShopKeybind() , "togglecustomshop" )

	shopBits = CustomNetTables.GetTableValue("custom_shop", "shop_bits")

	var schema = CustomNetTables.GetTableValue("custom_shop", "schema")
	if (typeof(schema) != "undefined") {
		for ( var shopName in schema) {
			shopList.push(shopName)
			ConstructShop(shopName, schema[shopName])	

			var entities = Entities.GetAllEntitiesByName("CUSTOM_SHOP_"+shopName)
			for ( var entID of entities) {
				if ( Entities.IsShop(entID) ) {
					shopEntities[entID] = shopName
				}
			}
		}
	}

	SetOpenedShop("Home") 
	SetOpenedPage("Basic")  

	OnHeroPick()

	InitCommonItems()
	InitQuickBuy() 

	UpdateShopButton()

})();
