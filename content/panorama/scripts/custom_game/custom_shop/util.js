function FindDotaHudElement (id) {
	return GetDotaHud().FindChildTraverse(id);
}
function GetDotaHud () {
	var p = $.GetContextPanel();
	while (p !== null && p.id !== 'Hud') {
		p = p.GetParent();
	}
	if (p === null) {
		throw new HudNotFoundException('Could not find Hud root as parent of panel with id: ' + $.GetContextPanel().id);
	} else {
		return p;
	}
}
/**
 * Takes an array-like table passed from Lua that has stringified indices starting from 1
 * and returns an array of type T containing the elements of the table.
 * Order of elements is preserved.
 */
function LuaTableToArray (table) {
	var array = [];
	for (var i = 1; table[i.toString()] !== undefined; i++) {
		array.push(table[i.toString()]);
	}
	return array;
}

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
	/*var buff = Entities.FindModifier(entID, "modifier_custom_shop")
	
	if (buff != -1)
		return Buffs.GetStackCount( entID, buff);*/

	var t = CustomNetTables.GetTableValue("custom_shop", "shop_mask_"+entID)
	
	if (t != undefined)
		return t.mask

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

/*
	Author:
		Noya
		Chronophylos
	Credits:
		Noya
	Description:
		Returns gold with commas and k
*/
function FormatGold (gold) {
	var formatted = FormatComma(gold);
	if (gold.toString().length > 6) {
		return FormatGold(gold.toString().substring(0, gold.toString().length - 5) / 10) + 'M';
	} else if (gold.toString().length > 4) {
		return FormatGold(gold.toString().substring(0, gold.toString().length - 3)) + 'k';
	} else {
		return formatted;
	}
}

/*
	Author:
		Noya
	Credits:
		Noya
	Description:
		Inserts Commas every 3 chars
		We use a whitespace because of some DIN
*/
function FormatComma (value) {
	try {
		return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	} catch (e) {}
}


//https://github.com/MNoya/Element-TD/blob/master/content/dota_addons/element_td/panorama/scripts/clicks.js
function GetMouseTarget()
{
	var mouseEntities = GameUI.FindScreenEntities( GameUI.GetCursorPosition() )
	var localHeroIndex = Players.GetPlayerHeroEntityIndex( Players.GetLocalPlayer() )

	for ( var e of mouseEntities )
	{
		if ( !e.accurateCollision )
			continue
		return e.entityIndex
	}

	for ( var e of mouseEntities )
	{
		return e.entityIndex
	}

	return 0
}