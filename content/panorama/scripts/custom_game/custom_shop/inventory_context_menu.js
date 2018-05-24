"use strict";

function DismissMenu()
{
	$.DispatchEvent( "DismissAllContextMenus" )
}

function Sell()
{
	DismissMenu()
	Items.LocalPlayerSellItem( $.GetContextPanel().Item );
}

function Disassemble()
{
	DismissMenu()
	Items.LocalPlayerDisassembleItem( $.GetContextPanel().Item );
}

function Alert()
{
	DismissMenu()
	Items.LocalPlayerItemAlertAllies( $.GetContextPanel().Item );
}

function DropFromStash() {
	DismissMenu()
	Items.LocalPlayerDropItemFromStash( $.GetContextPanel().Item );
}

function MoveToStash() {
	DismissMenu()
	Items.LocalPlayerMoveItemToStash( $.GetContextPanel().Item );
}
function LockCombine() {
	DismissMenu()
	Game.PrepareUnitOrders({
		OrderType : dotaunitorder_t.DOTA_UNIT_ORDER_SET_ITEM_COMBINE_LOCK,
		AbilityIndex: $.GetContextPanel().Item
	});
}

function UnlockCombine() {
	DismissMenu()
	Game.PrepareUnitOrders({
		OrderType : dotaunitorder_t.DOTA_UNIT_ORDER_SET_ITEM_COMBINE_LOCK,
		AbilityIndex: $.GetContextPanel().Item,
		TargetIndex: 0 //Valve uses this as a boolean that defaults to true
	});
	
}

function ShowInShop() {
	DismissMenu()
	GameUI.CustomShop.ShowItem( Abilities.GetAbilityName( $.GetContextPanel().Item ) )
}

//update sell counter
var fullCostSellTime = 10
var purchaseTime = Items.GetPurchaseTime( $.GetContextPanel().Item )
var func = function() {
	if ( Game.GetGameTime()-purchaseTime <= fullCostSellTime ) {
		$("#SellBackSeconds").text = "(" + FormatTime(fullCostSellTime - ( Game.GetGameTime() - purchaseTime ) ) + ")" 
	}
	else {
		$("#SellBackSeconds").style.visibility = "collapse"
		return
	}
	$.Schedule(0.1, func)
}
func()

function FormatTime(time) {
	time = Math.ceil(time)
	
	var s = Math.floor(time/60) + ":"
	time = time % 60
	if (time < 10)
		s = s + "0"

	s = s + time
	
	return s
}
