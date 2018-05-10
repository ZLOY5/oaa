
local function SetCommonItems(event)
	SendToConsole("dota_shop_common_items "..event.common_items)
	SendToConsole("host_writeconfig")
end

local function SetStickyItems(event)
	SendToConsole("hud_sticky_item_name "..event.sticky_item)
	SendToConsole("host_writeconfig")
end

local wrapper = {}
wrapper.SetCommonItems = SetCommonItems
wrapper.SetStickyItems = SetStickyItems

ListenToGameEvent("custom_shop_common_items", Dynamic_Wrap(wrapper, "SetCommonItems"), nil)
ListenToGameEvent("custom_shop_sticky_item", Dynamic_Wrap(wrapper, "SetStickyItems"), nil)