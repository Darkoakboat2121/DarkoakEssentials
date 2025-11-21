This Minecraft bedrock addon is an essentials addon. Please credit me if you're going to use the code.

Plans:

community:
    auction house
    player shop
    plots
    item trading

tracking:
    blocks broken
    blocks placed
    minutes played
    deaths
    kills

other:
    sitting
    secret items giver
    trails
    safe op:
        has special tools that emulate certain commands
        can fly
        breaks deny blocks near player and replaces blocks once away
        only do-admins can change player to safe op and back
        blocks do-admins from entering safe op
    auto-chest refill



chat:
    
    
anticheat:
    (toggle) detect if player has lots of valuable resources
    (toggle) detect if player is near command block minecart
    (dropdown) player picker [top option is empty] for hack test, uses /inputpermission then checks if player is still moving
    (toggle) adds unique id to every item than checks items for duped ids, therefore duped item


currently working on is below here

Plots are similar but build structures in a co-ord space. This will get a tutorial on youtube to explain how to use it.


* means todo 
*? means todo optional, probably planned
?? means idk if working
*& means, sorta working?
<b>f</b>
changelog:
    added:
        save/load inventory commands *? (methods: structure saving with: [chests, entities])
        leveling system *?


        trivia chat game ***
        animated action forms ***

        more feature toggles **

        arrow border killer *
        plots *
        dynamic shops *
        animated builds * (help soul please when we make this)
        vertical slabs!!!! *
        money and score linkage system *
        more punishments (make them like trolling) *
        lifesteal system *
        trading system * (between p to p and p to e)
        censor warning system *
        dynamic lightning system *
        
        
        veinminer stuff for both trees and ores
        crates (rewards should be commands) -----still needs work


        we circle maker /wecircle *
        spawn protection settings *
        extra ui to community ui, has creatable buttons with commands *
        uis should have references to uis that it came from, allows all uis to have back buttons with only one length *
        hole filler *
        afk timer *
        /boats leaderboard with @a *
        signs+ * (spinning signs, rainbow text, bad apple lol, delays, slideshows)
        kits! *
        owner system *
        alt uis *


    fixed:
        shop
        mob gens (its for real this time)
        sidebar bug where it would accept two usages of the score replacer

        lava / water bucket use on world protected areas ***
        anti-velocity *
        owner fix *
        landclaims * (interactions with entities and admin claims)

        
    changes:
        

        /attribute having a growth / shrinkage instead of instant, it should be togglable *
        more stuff to profiles *

    experimental:
        anti-zd
        invsee

        http requests *

    removed:
        
        

IDEA NOTE: for the array things, use a var and a ++ iterator so you can just copy them for long settings
naman1141

IDEA NOTE: for things that constantly get data, delay each by 20 ticks for retrieval

IDEA NOTE: "minecraft:entity_created" listen for this event, might use component system idk, datadrivenentitytrigger?

IDEAS:
clean up option
announcement system
leaderboards
tags to have pariticles
cosmetics system

for misty:
crates
nametags have nicks
player grabbing

i do have some ideas to improve them though:
adding them to the roles editor (so you can give roles permission to break the certain gens)

https://github.com/NRGJobro/Horion-Open-SRC/tree/master/Horion/Module/Modules
https://github.com/TheProjectLumina/LuminaClient/blob/main/app/src/main/java/com/project/lumina/client/game/module/impl/


M IDEA: have a map in defaults file that has all the dynamic properties, then just retrieve them from that, when updating a property set map and dynamic property

hacks to detect:
Anti .xp: detect if xp level went up real fast (warn users not to use /xp with this module)
AirJump
Anti-Void
Auto-Sneak
Auto-Sprint: 1
Bhop
Elytra fly: 1
Fast Ladder: 1
Fast Stop
Fly: 1, 2, 3
Glide
High Jump: y velocity is too high when jumping and not gliding and no height-effects
Inventory Move
Jesus: not falling and not in water and not on ground and block below is water
Jetpack
NoClip
NoFall
NoSlowDown
Phase
Scaffold: not looking at block when placing block
Speed: 1
Spider
Step
Velocity
Reach
Spammer: 1
NoPacket
Block Reach: 1
Tower
Entity Fly
Entity Jesus
Entity Speed
HitBox
Kill Aura: 1
.give: yeah idk, maybe check for nearby items? (that method wouldnt work with /give)



UIS:
    darko - server transfer ui
    