LinkLuaModifier("modifier_standard_capture_point", "modifiers/modifier_standard_capture_point.lua", LUA_MODIFIER_MOTION_NONE)

CAPTUREPOINT_IS_STARTING = 60
CapturePoints = CapturePoints or {}
local Zones = {
-- TODO, change this. These should be zones in the map or programatically generated
-- hard coded is a bad in-between with the disadvantages of both
  { left = Vector( -1280, -640, 0), right = Vector( 1280, 768, 0) }, --Zones
  { left = Vector( -1920, -768, 0), right = Vector( 1920, 768, 0) },
  { left = Vector( -2176, -384, 0), right = Vector( 2176, 384, 0) },
  { left = Vector( -960, -1280, 0), right = Vector( 1152, 1280, 0) },
  { left = Vector( -640, -1664, 0), right = Vector( 1024, 1664, 0) },
  { left = Vector( -2048, -1408, 0), right = Vector( 1792, 1280, 0) },
  { left = Vector( -2304, -2048, 0), right = Vector( 2304, 2048, 0) },
  { left = Vector( -1664, -1920, 0), right = Vector( 1920, 1920, 0) },
  { left = Vector( -1408, -3200, 128), right = Vector( 1408, 3200, 128) },
  { left = Vector( -1792, -2816, 128), right = Vector( 1792, 2816, 128) },
  { left = Vector( -2304, -2944, 128), right = Vector( 2304, 2944, 128) },
  { left = Vector( -1566, -3584, 128), right = Vector( 1566, 3584, 128) },
  { left = Vector( -1152, -4096, 128), right = Vector( 1152, 4096, 128) },
  { left = Vector( -2944, -3072, 128), right = Vector( 2944, 3072, 128) },
  { left = Vector( -3584, -3072, 128), right = Vector( 3584, 3072, 128) },
  { left = Vector( -4992, -3200, 128), right = Vector( 4992, 3200, 128) },
  { left = Vector( -1280, 768, 0), right = Vector( 1280, -768, 0) },
  { left = Vector( -1920, 768, 0), right = Vector( 1920, -768, 0) },
  { left = Vector( -2176, 384, 0), right = Vector( 2176, -384, 0) },
  { left = Vector( -1024, 1280, 0), right = Vector( 1152, -1280, 0) },
  { left = Vector( -1024, 1664, 0), right = Vector( 1024, -1664, 0) },
  { left = Vector( -1664, 1280, 0), right = Vector( 1792, -1280, 0) },
  { left = Vector( -2304, 2048, 0), right = Vector( 2304, -2048, 0) },
  { left = Vector( -1664, 1920, 0), right = Vector( 1664, -1920, 0) },
  { left = Vector( -1408, 3200, 128), right = Vector( 1408, -3200, 128) },
  { left = Vector( -1792, 2816, 128), right = Vector( 1792, -2816, 128) },
  { left = Vector( -2304, 2944, 128), right = Vector( 2304, -2944, 128) },
  { left = Vector( -1566, 3584, 128), right = Vector( 1566, -3584, 128) },
  { left = Vector( -1152, 4096, 128), right = Vector( 1152, -4096, 128) },
  { left = Vector( -2944, 3072, 128), right = Vector( 2944, -3072, 128) },
  { left = Vector( -3584, 3072, 128), right = Vector( 3584, -3072, 128) },
  { left = Vector( -4992, 3200, 128), right = Vector( 4992, -3200, 128) }}

local NumZones = 32
local NumCaptures = 0
local LiveZones = 0
local Start = Event()
local PrepareCapture = Event()
local CaptureFinished = Event()
local CurrentZones = {}
CapturePoints.onPreparing = PrepareCapture.listen
CapturePoints.onStart = Start.listen
CapturePoints.onEnd = CaptureFinished.listen

function CapturePoints:Init ()
  Debug.EnableDebugging()
  DebugPrint('Init capture point')

  self.currentCapture = nil

  Timers:CreateTimer(INITIAL_CAPTURE_POINT_DELAY - 60, function ()
    self:StartCapture()
  end)

  -- Add chat commands to force start and end captures
  ChatCommand:LinkCommand("-capture", Dynamic_Wrap(self, "StartCapture"), self)
  ChatCommand:LinkCommand("-end_capture", Dynamic_Wrap(self, "EndCapture"), self)
end

function CapturePoints:IsActive ()
  if not self.currentCapture or self.currentCapture == CAPTUREPOINT_IS_STARTING then
    return false
  end
  return true
end

function CapturePoints:MinimapPing()
  --Pings Minimap about zones
  Timers:CreateTimer(3.2, function ()
    Minimap:SpawnCaptureIcon(CurrentZones.right)
  end)
  Minimap:SpawnCaptureIcon(CurrentZones.left)
  for playerId = 0,19 do
    local player = PlayerResource:GetPlayer(playerId)
    if player ~= nil then
      if player:GetAssignedHero() then
        if player:GetTeam() == DOTA_TEAM_BADGUYS then
          MinimapEvent(DOTA_TEAM_GOODGUYS, player:GetAssignedHero(), CurrentZones.left.x,  CurrentZones.left.y, DOTA_MINIMAP_EVENT_HINT_LOCATION, 3)
          Timers:CreateTimer(3.2, function ()
            MinimapEvent(DOTA_TEAM_GOODGUYS, player:GetAssignedHero(), CurrentZones.right.x,  CurrentZones.right.y, DOTA_MINIMAP_EVENT_HINT_LOCATION , 3)
          end)
        else
          MinimapEvent(DOTA_TEAM_GOODGUYS, player:GetAssignedHero(), CurrentZones.left.x,  CurrentZones.left.y, DOTA_MINIMAP_EVENT_HINT_LOCATION, 3)
          Timers:CreateTimer(3.2, function ()
            MinimapEvent(DOTA_TEAM_GOODGUYS, player:GetAssignedHero(), CurrentZones.right.x,  CurrentZones.right.y, DOTA_MINIMAP_EVENT_HINT_LOCATION , 3)
          end)
        end
      end
    end
  end
end

function CapturePoints:StartCapture()
  if self.startCaptureTimer then
    Timers:RemoveTimer(self.startCaptureTimer)
    self.startCaptureTimer = nil
  end
  PrepareCapture.broadcast(true)
  self.startCaptureTimer = Timers:CreateTimer(CAPTURE_INTERVAL, function ()
    self:StartCapture()
  end)

  if self.currentCapture then
    DebugPrint ('There is already a capture running')
    return
  end

  self.currentCapture = CAPTUREPOINT_IS_STARTING
  --Chooses random zone
  CurrentZones = Zones[RandomInt(1, NumZones)]
  --If statemant checks for duel interference
  if not Duels.startDuelTimer then
    self.currentCapture = {
      y = 1
    }
    self:MinimapPing(5)
    Notifications:TopToAll({text="Capture Points will be active in 1 minute!", duration=3.0, style={color="blue", ["font-size"]="70px"}})
    Timers:CreateTimer(CAPTURE_SECOND_WARN, function ()
      Notifications:TopToAll({text="Capture Points will be active in 30 seconds!", duration=3.0, style={color="blue", ["font-size"]="70px"}})
      self:MinimapPing(5)
    end)

    for index = 0,(CAPTURE_START_COUNTDOWN - 1) do
      Timers:CreateTimer(CAPTURE_FIRST_WARN - CAPTURE_START_COUNTDOWN + index, function ()
        Notifications:TopToAll({text=(CAPTURE_START_COUNTDOWN - index), duration=1.0})
      end)
    end

    Timers:CreateTimer(CAPTURE_FIRST_WARN, function ()
      self:ActuallyStartCapture()
    end)
  elseif Timers.timers[Duels.startDuelTimer] and Timers:RemainingTime(Duels.startDuelTimer) > 90 then
    self.currentCapture = {
      y = 1
    }
    Notifications:TopToAll({text="Capture Points will be active in 1 minute!", duration=3.0, style={color="red", ["font-size"]="70px"}})
    self:MinimapPing(5)
    Timers:CreateTimer(CAPTURE_SECOND_WARN, function ()
      Notifications:TopToAll({text="Capture Points will be active in 30 seconds!", duration=3.0, style={color="red", ["font-size"]="70px"}})
      self:MinimapPing(5)
    end)

    for index = 0,(CAPTURE_START_COUNTDOWN - 1) do
      Timers:CreateTimer(CAPTURE_FIRST_WARN - CAPTURE_START_COUNTDOWN + index, function ()
        Notifications:TopToAll({text=(CAPTURE_START_COUNTDOWN - index), duration=1.0})
      end)
    end

    Timers:CreateTimer(CAPTURE_FIRST_WARN, function ()
      self:ActuallyStartCapture()
    end)
  else
    local unlisten = Duels.onEnd(function ()
      Timers:CreateTimer(15, function ()
        self.currentCapture = {
          y = 1
        }
        Notifications:TopToAll({text="Capture Points will be active in 1 minute!", duration=3.0, style={color="red", ["font-size"]="70px"}})
        self:MinimapPing(5)
        Timers:CreateTimer(CAPTURE_SECOND_WARN, function ()
          Notifications:TopToAll({text="Capture Points will be active in 30 seconds!", duration=3.0, style={color="red", ["font-size"]="70px"}})
          self:MinimapPing(5)
        end)

        for index = 0,(CAPTURE_START_COUNTDOWN - 1) do
          Timers:CreateTimer(CAPTURE_FIRST_WARN - CAPTURE_START_COUNTDOWN + index, function ()
            Notifications:TopToAll({text=(CAPTURE_START_COUNTDOWN - index), duration=1.0})
          end)
        end

        Timers:CreateTimer(CAPTURE_FIRST_WARN, function ()
          self:ActuallyStartCapture()
        end)
      end)
    end)
  end
end

function CapturePoints:GiveItemToWholeTeam (item, teamId)
  PlayerResource:GetPlayerIDsForTeam(teamId):each(function (playerId)
    local hero = PlayerResource:GetSelectedHeroEntity(playerId)

    if hero then
      hero:AddItemByName(item)
    end
  end)
end

function CapturePoints:Reward(teamId)
  local team = GetShortTeamName(teamId)
  if not IsPlayerTeam(teamId) then
    return
  end

  if NumCaptures == 1 then
    self:GiveItemToWholeTeam("item_upgrade_core", teamId)
  elseif NumCaptures == 2 then
    self:GiveItemToWholeTeam("item_upgrade_core_2", teamId)
  elseif NumCaptures == 3 then
    self:GiveItemToWholeTeam("item_upgrade_core_3", teamId)
  elseif NumCaptures >= 4 then
    self:GiveItemToWholeTeam("item_upgrade_core_4", teamId)
  end
  LiveZones = LiveZones - 1
  if LiveZones <= 0 then
    CapturePoints:EndCapture()
  end
end

function CapturePoints:ActuallyStartCapture()
  LiveZones = 2
  NumCaptures = NumCaptures + 1
  Notifications:TopToAll({text="Capture Points Active!", duration=3.0, style={color="red", ["font-size"]="80px"}})
  self:MinimapPing()
  DebugPrint ('CaptureStarted')
  Start.broadcast(self.currentCapture)
  local capturePointThinker1 = CreateModifierThinker(nil, nil, "modifier_standard_capture_point", nil, CurrentZones.left, DOTA_TEAM_NEUTRALS, false)
  local capturePointModifier1 = capturePointThinker1:FindModifierByName("modifier_standard_capture_point")
  capturePointModifier1:SetCallback(partial(self.Reward, self))
  local capturePointThinker2 = CreateModifierThinker(nil, nil, "modifier_standard_capture_point", nil,  CurrentZones.right, DOTA_TEAM_NEUTRALS, false)
  local capturePointModifier2 = capturePointThinker2:FindModifierByName("modifier_standard_capture_point")
  capturePointModifier2:SetCallback(partial(self.Reward, self))
end

function CapturePoints:EndCapture ()
  if self.currentCapture == nil then
    DebugPrint ('There is no Capture running')
    return
  end
  Notifications:TopToAll({text="Capture Ended", duration=3.0, style={color="blue", ["font-size"]="110px"}})
  DebugPrint('Capture Point has ended')
  CaptureFinished.broadcast(self.currentCapture)
  local currentCapture = self.currentCapture
  self.currentCapture = nil


end
