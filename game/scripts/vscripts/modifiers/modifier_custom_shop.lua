modifier_custom_shop = class(ModifierBaseClass)

function modifier_custom_shop:IsPurgable()
	return false
end

function modifier_custom_shop:IsHidden()
	return true
end

function modifier_custom_shop:RemoveOnDeath()
	return false
end