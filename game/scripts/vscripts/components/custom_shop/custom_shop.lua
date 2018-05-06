-- uses keyvalues.lua library

CustomShop = CustomShop or {}

CUSTOM_SHOP_TEAM_MIN = DOTA_TEAM_GOODGUYS --for stock purposes
CUSTOM_SHOP_TEAM_MAX = DOTA_TEAM_BADGUYS

LinkLuaModifier("modifier_custom_shop", "modifiers/modifier_custom_shop.lua", LUA_MODIFIER_MOTION_NONE)

function CustomShop:Init()
	self.itemEntryList = {}
	self.itemsWithStockCount = {}

	self.schema = require('components/custom_shop/schema')
	CustomNetTables:SetTableValue("custom_shop", "schema", self.schema)

	self.shopBits = {}
	local i = 0
	for shopName,_ in pairs(self.schema) do
		local s = "CUSTOM_SHOP_"..shopName
		_G[s] = math.pow(2, i) --assign bit to each shop
		self.shopBits[s] = _G[s]
		i = i + 1
	end
	CustomNetTables:SetTableValue("custom_shop", "shop_bits", self.shopBits)
	
	CustomShop:InitItems()
	CustomShop:InitTriggers() -- triggers must be named CUSTOM_SHOP_..shopName, example: CUSTOM_SHOP_Home

	--DeepPrintTable(self:GetItemEntry("item_vladmir"))
	--DeepPrintTable(self:GetItemEntry("item_heart_2"))

	local popularKV = LoadKeyValues("scripts/npc/npc_popular_items.txt")
	if popularKV then
		for heroName, t in pairs(popularKV ) do
			CustomNetTables:SetTableValue("custom_shop", "popular_items"..heroName, t.popular_items)
		end
	end

	CustomShop.InitialThink = true
	GameEvents:OnPreGame(function() 
		GameRules:GetGameModeEntity():SetThink("StockThink", CustomShop, 0)  
	end)

	--CustomGameEventManager:RegisterListener("custom_shop_buy", Dynamic_Wrap(CustomShop, "BuyRequest"))

	FilterManager:AddFilter(FilterManager.ExecuteOrder, self, Dynamic_Wrap(CustomShop, "OrderFilter"))

	ListenToGameEvent("dota_item_purchased",  Dynamic_Wrap(CustomShop, 'OnItemPurchased'), self)
	ListenToGameEvent("dota_item_combined",  Dynamic_Wrap(CustomShop, 'OnItemCombined'), self)
end

function CustomShop:InitTriggers()
	local triggers = Entities:FindAllByClassname("trigger_dota")

	for _, trig in pairs(triggers) do
		if string.find(trig:GetName(), "CUSTOM_SHOP_") then
			trig.OnStartTouch = Dynamic_Wrap(CustomShop, "OnStartTouch")
			trig.OnEndTouch = Dynamic_Wrap(CustomShop, "OnEndTouch")
			trig:RedirectOutput("OnStartTouch", "OnStartTouch", trig)
			trig:RedirectOutput("OnEndTouch", "OnEndTouch", trig)
		end
	end
end

function CustomShop.OnStartTouch(self, args) --when unit enters in shop range
	local unit = args.activator
	local trigger = args.caller

	if unit and unit:HasInventory() then
		local shopBit = CustomShop.shopBits[ trigger:GetName() ]

		if not shopBit then
			print("[CustomShop] OnStartTouch: unknown shop name "..trigger:GetName() )
			return
		end
		
		unit:SetUnitShopMask( bit.bor( unit:GetUnitShopMask(), shopBit ) ) --set bit assigned to shop
		
	end
end

function CustomShop.OnEndTouch(self, args) 
	local unit = args.activator
	local trigger = args.caller

	if unit and unit:HasInventory() then
		local shopBit = CustomShop.shopBits[ trigger:GetName() ]

		if not shopBit then
			print("[CustomShop] OnEndTouch: unknown shop name "..trigger:GetName() )
			return
		end

		unit:SetUnitShopMask( bit.band( unit:GetUnitShopMask(), bit.bnot(shopBit) ) ) --сlear bit assigned to shop

	end
end



function CustomShop:InitItems()

	local itemList = {}

	for itemName,KV  in pairs(KeyValues["ItemKV"]) do --contruct item entries for all items in game
		if string.find(itemName, "item_") and not self:GetItemEntry(itemName) and type(KV) == "table" then
			local entry = ItemEntry(itemName)
		
			self.itemEntryList[itemName] = entry
			
			if entry.StockTime ~= nil then 
				table.insert(self.itemsWithStockCount, itemName)
			end

			table.insert(itemList, itemName)
		end
	end

	local strItemList = json.encode(itemList) --lol, max net table key size = 16kb
	
	part1 = string.sub(strItemList, 1, 16000)
	part2 = string.sub(strItemList, 16001)
	CustomNetTables:SetTableValue("custom_shop", "item_list1", {itemList = part1})
	CustomNetTables:SetTableValue("custom_shop", "item_list2", {itemList = part2})

	for itemName,entry in pairs(self.itemEntryList) do --populate partOf list of all entries
		if entry.Requirements then  
			for n,req in pairs(entry.Requirements) do
				for i=1,#req do
					local reqItemName = req[i]
					local reqEntry = self:GetItemEntry(reqItemName)
					if reqEntry and not vlua.find(reqEntry.partOf, itemName) then 
						table.insert(reqEntry.partOf, itemName)
					end
				end
			end
		end
	end

	for shop,shopSchema in pairs(self.schema) do
		local shopName = "CUSTOM_SHOP_"..shop
		for _,pageSchema in pairs(shopSchema) do
			for _,column in pairs(pageSchema) do
				for _,itemName in pairs(column) do
					local entry = self:GetItemEntry(itemName)

					if entry then
						entry:SetAvailableInShop(CustomShop.shopBits[shopName], true)
					else
						print("[Custom Shop] InitItems: Unknown item name in schema "..itemName)
					end
				end
			end
		end
	end

	for itemName,entry in pairs(self.itemEntryList) do
		entry:UpdateClient()
	end

end

function CustomShop:GetItemEntry(itemName)
	return self.itemEntryList[itemName]
end

function CustomShop:StockThink()
	for _,itemName in pairs(self.itemsWithStockCount) do
		local entry = self:GetItemEntry(itemName)

		if entry then
			entry:Think(CustomShop.InitialThink)
		end

	end

	CustomShop.InitialThink = false

	return 0.1
end

function CustomShop:BuyRequest(event)
	--DeepPrintTable(event)
	
	local playerID = event.PlayerID
	local unit = EntIndexToHScript(event.unit)
	local itemName = event.itemName

	local hero = PlayerResource:GetSelectedHeroEntity(playerID)

	if not unit:HasInventory() or unit:IsIllusion() then
		return
	end
		
	--player can buy items only for his units or team courier
	if not( unit:GetPlayerOwnerID() == playerID or (unit:IsCourier() and unit:GetTeam() == hero:GetTeam()) ) then 
		return
	end

	--dead units cant buy, but dead hero can
	if not unit:IsAlive() and not unit:IsRealHero() then
		return
	end
		
	local itemEntry = CustomShop:GetItemEntry(itemName)
	if not itemEntry then
		print("[Custom Shop] BuyRequest: Unknown item name "..itemName)
		return
	end


	if PlayerResource:GetGold(playerID) < itemEntry.GoldCost then
		return
	end

	--[[local unitAtHome = unit:IsInRangeOfShop(CUSTOM_SHOP_Home)

	if unit:IsInRangeOfShop(itemEntry.ShopAvailability) and unit:GetFirstEmptyInventorySlot() ~= -1 then
		local item = CreateItem(itemName, hero, hero)
		unit:AddItem(item)
		print("BUY")
	elseif itemEntry:IsAvailableInShop(CUSTOM_SHOP_Home) then

	end]]

end

function CustomShop:OrderFilter(filterTable)
	--DeepPrintTable(filterTable)
	return true	
end


function CustomShop:OnItemPurchased(event) 
	--DeepPrintTable(event)

	local entry = self:GetItemEntry(event.itemname)

	if entry then
		if entry.StockTime then
			local team = PlayerResource:GetTeam(event.PlayerID)

			entry:DecrementStockCount(team)
		end
	end
end

function CustomShop:OnItemCombined(event) 
	--DeepPrintTable(event)

	local player = PlayerResource:GetPlayer(event.PlayerID)
	if player then
		CustomGameEventManager:Send_ServerToPlayer(player, "local_player_item_combined", { itemName = event.itemname } )
	end
end

function CDOTA_BaseNPC:SetUnitShopMask(mask)
	self.customShopMask = mask
	--print(self:GetUnitName(), mask)
	
	--[[local mod = self:AddNewModifier(self, nil, "modifier_custom_shop", nil)
	if mod then
		mod:SetStackCount(mask) 
	end]]

	CustomNetTables:SetTableValue("custom_shop", "shop_mask_"..self:entindex(), { mask = mask })

	--FireGameEvent("custom_shop_unit_mask_changed", { unit = self:entindex() } )
end

function CDOTA_BaseNPC:GetUnitShopMask()
	return self.customShopMask or 0
end

-- if you want check is unit in range of Home shop - nShop = CUSTOM_SHOP_Home
-- if you want check is unit in range of Home OR Side shop - nShop = CUSTOM_SHOP_Home + CUSTOM_SHOP_Side
function CDOTA_BaseNPC:IsInRangeOfShop(nShop) 
	local i = self:GetUnitShopMask()
	if i >= 1 then
		return bit.band(i,nShop) ~= 0
	end

	return false
end

function CDOTA_BaseNPC:GetFirstEmptyInventorySlot()
	local slots = self:IsRealHero() and 14 or 8

	for i=0,slots do
		if not self:GetItemInSlot(i) then
			return i
		end
	end

	return -1
end

function CDOTA_BaseNPC:GetSlotOfItem(item)
	local slots = self:IsRealHero() and 14 or 8

	for i=0,slots do
		if self:GetItemInSlot(i) == item then
			return i
		end
	end

	return -1
end

function PrintItems(unit)
	for i=0,15 do
		local item = unit:GetItemInSlot(i)
		if item then
			print(i,item:GetAbilityName(), item:entindex())
		end
	end
end