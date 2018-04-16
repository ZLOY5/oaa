
local function SetCommonItems(event)
    SendToConsole("dota_shop_common_items "..event.common_items)
    SendToConsole("host_writeconfig")
end

local wrapper = {}
wrapper.func = SetCommonItems

ListenToGameEvent("custom_shop_common_items", Dynamic_Wrap(wrapper, "func"), nil)