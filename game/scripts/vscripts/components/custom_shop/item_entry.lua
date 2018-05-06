local constructor = function(self, itemName)
	local itemData = KeyValues["ItemKV"][itemName]
	
	if itemData == nil then
		return 
	end	

	self.itemName = itemName
	self.ItemID = itemData.ID or 0
	self.GoldCost = itemData.ItemCost or 0
	self.IsRecipe = itemData.ItemRecipe == 1
	self.IsPurchasable = itemData.ItemPurchasable ~= 0
	self.Aliases = itemData.ItemAliases
	self.ShopTags = itemData.ItemShopTags

	self.VisibleInInspectTree = itemData.ItemBaseLevel ~= nil

	self.ShopAvailability = 0 --determined by shop schema

	self.partOf = {} --itemName item can be combined into one of items from this list

	if not self.IsRecipe then

		local recipeName = string.gsub(itemName, "item_", "item_recipe_")
		local recipeKV = KeyValues["ItemKV"][recipeName]

		if recipeKV and recipeKV.ItemRequirements then
			self.Requirements = {}
			
			for k,v in pairs(recipeKV.ItemRequirements) do
				local n = tonumber(k)
				local recipe = string.split(v,";")
				if n and recipe then
					self.Requirements[n] = recipe
				end
			end

			--[[for k,v in pairs(self.Recipes) do
				for _,v2 in pairs(v) do
					local entry = CustomShop:GetItemEntry(v2)
					
					if entry == nil then
						entry = ItemEntry(v2)
						CustomShop.itemEntryList[itemName] = entry
						if entry.StockTime ~= nil then
							table.insert(CustomShop.itemsWithStockCount, v2)
						end
					end
					
					table.insert(entry.partOf, itemName)
				end
			end]]
		end
	end

	if itemData.ItemStockTime and itemData.ItemStockMax then
		--separate stock for each team
		self.StockCount = {}
		self.StockIncrementTime = {}  --game time of the next stock count increment

		for team = CUSTOM_SHOP_TEAM_MIN, CUSTOM_SHOP_TEAM_MAX do
			self.StockCount[team] = itemData.ItemStockInitial or itemData.ItemStockMax
			self.StockIncrementTime[team] = -1
		end
		
		self.StockMax = itemData.ItemStockMax 
		self.StockTime = itemData.ItemStockTime or 1

		if itemData.ItemInitialStockTime then
			self.InitialStockTime = itemData.ItemInitialStockTime
		end
	end

	self:UpdateClient()
end

ItemEntry = class( { constructor = constructor} )

function ItemEntry:GetItemName() 
	return self.itemName
end

function ItemEntry:UpdateClient()
	CustomNetTables:SetTableValue("custom_shop", "entry_"..self.itemName, self)
end

function ItemEntry:IncrementStockCount(teamNumber)
	if self.StockCount and self.StockCount[teamNumber] < self.StockMax then
		self.StockCount[teamNumber] = self.StockCount[teamNumber] + 1
		--print(self:GetItemName(), self.StockCount[teamNumber], teamNumber)
		self:Think()
		self:UpdateClient()
	end
end

function ItemEntry:DecrementStockCount(teamNumber)
	if self.StockCount and self.StockCount[teamNumber] > 0 then
		self.StockCount[teamNumber] = self.StockCount[teamNumber] - 1
		self:Think()
		self:UpdateClient()
	end
end


function ItemEntry:GetStockCount(teamNumber)
	if self.StockCount then
		return self.StockCount[teamNumber]
	end
	return -1
end

function ItemEntry:Think(bInitial)
	local time = GameRules:GetGameTime()

	--print(self:GetItemName())

	for team = CUSTOM_SHOP_TEAM_MIN, CUSTOM_SHOP_TEAM_MAX do
		if self.StockCount[team] < self.StockMax then
			if self.StockIncrementTime[team] <= time then
				if self.StockIncrementTime[team] == -1 then
					self.Initial = bInitial
					self.StockIncrementTime[team] = time + (bInitial and self.InitialStockTime or self.StockTime)
					self:UpdateClient()
				else
					self.StockIncrementTime[team] = self.StockIncrementTime[team] + self.StockTime
					self:IncrementStockCount(team)
				end
			end
		else
			self.StockIncrementTime[team] = -1
		end
	end	
end

function ItemEntry:GetRequirements(nVariant)
	nVariant = nVariant or 1
	if self.Requirements then
		return vlua.clone(self.Requirements[nVariant])
	end

	return 
end

function ItemEntry:GetRequirementsVariantCount()
	if self.Requirements then
		return #self.Requirements
	end

	return 0  
end

function ItemEntry:SetAvailableInShop(shopMask, bAvailable)
	if bAvailable then
		self.ShopAvailability = bit.bor( self.ShopAvailability, shopMask )
	else
		self.ShopAvailability = bit.band( self.ShopAvailability, bit.bnot(shopMask) )
	end

	if self.Requirements then --recipe(if exist) has same availability
		local recipeName = string.gsub(self.itemName, "item_", "item_recipe_")
		local recipeEntry = CustomShop:GetItemEntry(recipeName)

		if recipeEntry then
			recipeEntry.ShopAvailability = self.ShopAvailability
			recipeEntry:UpdateClient()
		end
	end

	self:UpdateClient()
end

function ItemEntry:IsAvailableInShop(shopMask)
	return bit.band(self.ShopAvailability, shopMask) ~= 0 
end