"use strict;"

function ShowInventoryContextMenu(contextPanel) {
	var contextItem = contextPanel.FindChildTraverse("AbilityButton").FindChildTraverse("ItemImage").contextEntityIndex

	if ( contextItem == -1 || !Entities.IsValidEntity(contextItem) )
		return

	var localPlayerID = Game.GetLocalPlayerID()
	var localPlayerHero = Players.GetPlayerHeroEntityIndex( localPlayerID  )
	var portraitUnit = Players.GetLocalPlayerPortraitUnit()
	var mainSelected = Players.GetSelectedEntities(localPlayerID)[0]

	var bSlotInStash = !!contextPanel.stash
	var bControllable = Entities.IsControllableByPlayer( portraitUnit, localPlayerID )
	var bSellable = Items.IsSellable( contextItem ) && Items.CanBeSoldByLocalPlayer( contextItem )
	var bDisassemble = Items.IsDisassemblable( contextItem ) && bControllable && !bSlotInStash
	var bAlertable = Items.IsAlertableItem( contextItem )
	var bShowInShop = Items.GetItemAvailability( Abilities.GetAbilityName(contextItem) ) != 0
	var bDropFromStash = bSlotInStash && bControllable

	//we have no API to check combine lock state, but until we use Dota UI we can check class
	var bLockCombine = !contextPanel.BHasClass("combine_locked") && bControllable
	var bUnlockCombine = contextPanel.BHasClass("combine_locked") && bControllable
	//$.Msg(bLockCombine+" "+bUnlockCombine)

	var bMoveToStash = false
	var bIsInventoryEditable = portraitUnit == mainSelected
	var bIsStashAccessible = Entities.IsInRangeOfCustomShop(portraitUnit, shopBits.CUSTOM_SHOP_Home) || !Entities.IsAlive(portraitUnit)

	if ( !bSlotInStash && bIsInventoryEditable && bIsStashAccessible && bControllable ) {
		bMoveToStash = true
	}

	if ( !bSellable && !bDisassemble && !bShowInShop && !bDropFromStash && !bAlertable && !bMoveToStash )
	{
		// don't show a menu if there's nothing to do
		return;
	}

	var contextMenu = $.CreatePanel( "ContextMenuScript", $.GetContextPanel(), "" );
	contextMenu.AddClass( "ContextMenu_NoArrow" );
	contextMenu.AddClass( "ContextMenu_NoBorder" );

	var contentsPanel = contextMenu.GetContentsPanel()

	contentsPanel.Item = contextItem;
	contentsPanel.SetHasClass( "bSellable", bSellable );
	contentsPanel.SetHasClass( "bDisassemble", bDisassemble );
	contentsPanel.SetHasClass( "bShowInShop", bShowInShop );
	contentsPanel.SetHasClass( "bDropFromStash", bDropFromStash );
	contentsPanel.SetHasClass( "bAlertable", bAlertable );
	contentsPanel.SetHasClass( "bMoveToStash", bMoveToStash );
	contentsPanel.SetHasClass( "bShowCombineLock", bLockCombine );
	contentsPanel.SetHasClass( "bShowCombineUnlock", bUnlockCombine );
	contentsPanel.BLoadLayout( "file://{resources}/layout/custom_game/custom_shop/inventory_context_menu.xml", false, false );
}

function HandleInventorySlot(slot) {
	
	$.RegisterEventHandler("DragEnter", slot, function(panel, draggedPanel) {
		if (draggedPanel.customShopItem) {
			slot.AddClass("potential_drop_target")
		}
	})

	$.RegisterEventHandler("DragLeave", slot, function(panel, draggedPanel) {
		if (draggedPanel.customShopItem) {
			slot.RemoveClass("potential_drop_target")
		}
	})

	$.RegisterEventHandler("DragDrop", slot, function(panel, draggedPanel) {
		if (draggedPanel.customShopItem) {
			BuyRequest(draggedPanel.itemname)
		}
	})

	var abilityButton = slot.FindChildTraverse("AbilityButton")
	abilityButton.hittest = false

	/* Dear Valve, why event oncontextmenu doesnt work for DOTAAbilityButton?
	
	abilityButton.SetPanelEvent("oncontextmenu", function(panel, test) {
		$.Msg(panel, test)
	})

	$.RegisterEventHandler('ContextMenu', abilityButton, function(panel, test) {
		$.Msg(panel, test)
	})*/

	var button = slot.FindChildTraverse("ButtonSize").FindChild("Button") 
	if ( button != undefined )
		button.DeleteAsync(0)

	button = $.CreatePanel("Button", slot.FindChildTraverse("ButtonSize"), "Button")
	button.style.width = "100%"
	button.style.height = "100%"

	button.SetPanelEvent("onactivate", function() {
		if ( GameUI.IsAltDown() )
			Abilities.PingAbility( abilityButton.FindChildTraverse("ItemImage").contextEntityIndex )
		else
			Abilities.ExecuteAbility( abilityButton.FindChildTraverse("ItemImage").contextEntityIndex, Players.GetLocalPlayerPortraitUnit(), false )
	})

	button.SetPanelEvent("ondblclick", function() {
		Abilities.CreateDoubleTapCastOrder( abilityButton.FindChildTraverse("ItemImage").contextEntityIndex, Players.GetLocalPlayerPortraitUnit())
	}) 

	button.SetPanelEvent("oncontextmenu", function() {
		ShowInventoryContextMenu(slot)
	})

	slot.FindChildTraverse("ButtonSize").MoveChildBefore(button, abilityButton)
}

function InitInventory() {
	var stashRow = $.GetContextPanel().FindChildTraverse("stash").FindChildTraverse("stash_row")

	for (var slot of stashRow.Children()) {
		slot.stash = true
		HandleInventorySlot(slot)
	}

	var inventoryCont = FindDotaHudElement("lower_hud").FindChildTraverse("inventory").FindChildTraverse("InventoryContainer")

	for (var i = 0; i < 9; i++) {
		HandleInventorySlot( inventoryCont.FindChildTraverse("inventory_slot_"+i) )
	}

	$.RegisterForUnhandledEvent("Activated", function(panel) { $.Msg(panel) } )

}

InitInventory()