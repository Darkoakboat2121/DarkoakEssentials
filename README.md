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
        leveling system *?

        trivia chat game ***
        animated action forms ***

        arrow border killer *
        animated builds * (help soul please when we make this)
        vertical slabs!!!! *
        money and score linkage system *
        more punishments (make them like trolling) *
        lifesteal system *
        trading system * (between p to p and p to e)
        anti combat log system *
        personal settings command (to disable sitting, tpa, other optional stuff) *
        fake player spleef preset *
        animated sidebar *
        dynamic shops (player shops?) *
        export one player[] for all things to use if they dont have filters, put it in defaults lol * --------------------------no from N


        world edit item to move where /weactivecopy places and to move the selection area **
        
        
        
        offhand command
        players now get messages when they violated an antispam
        /p (private messaging system)
        search button to adminandplayer list
        ender dragons, withers, and command block minecarts to world protection
        world edit now has red/blue particles where p1 and p2 are
        /wecylinder, makes a line of blocks from point 1 to point 2 in a cylindrical pattern, set rad to 1 to have line
        /wecircle, makes a circle
        /weactivecopy, copies an area with a special viewing part
        more emojis!
        resetting system, for when the addon breaks
        /weundo, only works for sphere, activecopy, and cylinder


        alt finder UI -----still needs work
        crates (rewards should be commands) -----still needs work
        

        actual clans (should have: clan leader (can kick outta clan), clan members, private clan messaging) *
        scythe dummy item *
        dev tools: emulated packet reading *
        we circle maker /wecircle *
        spawn protection settings *
        extra ui to community ui, has creatable buttons with commands *
        uis should have references to uis that it came from, allows all uis to have back buttons with only one length *
        hole filler *
        afk timer *
        owner system *
        alt uis *


    fixed:
        dynamic lighting void bug
        data deleter ui crash
        anti-gamemode-switcher
        anti-streamer-mode, it also now doesnt make chat look weird
        anti-force-op bug
        lava / water bucket use on world protected areas


        ghost building midair ** (possibly fixed)


        sitting and wind charges *
        anti-velocity *
        owner fix *
        landclaims * (interactions with entities and admin claims)

        
    changes:
        the data deleter UI now has a searchval option
        plot players ui now have option for adding players so that player cant modify the plot. the toggle is on by default
        the addrankui now has chat and name color adding options
        auto-reponse now accepts multipel words/phrases to a replay
        anti-dupe only logs every 5 seconds
        anti-force-op has new improvements
        mob gens got improvements

        
        zones system should have private chats *
        /wepaste should have axis rotation *
        /attribute having a growth / shrinkage instead of instant, it should be togglable *
        more stuff to profiles *
        community item to phone item with new systems and better implementations of existing systems *

    experimental:
        anti-zd
        invsee
        grappling hook

        http requests *

    removed:






whenever that one command error with looped out or whatever, try removing all commands, then adding them back

NEW OP EXPLOIT
spoofs being host
does not complete joining, aka showing a join message (may complete but is very delayed)
prejoins does detect them
names are random and valid
kicking the hosts name might be a work around, but runs into the setmaxplayers issue, the one where only real players can run it
cannot /kick hacker because they register as host

        
        

IDEA NOTE: for the array things, use a var and a ++ iterator so you can just copy them for long settings
naman1141

IDEA NOTE: for things that constantly get data, delay each by 20 ticks for retrieval

IDEA NOTE: "minecraft:entity_created" listen for this event, might use component system idk, datadrivenentitytrigger?

IDEA NOTE: using the message limit json and the message filter json, you can spam 100 messages of a string to clear chat

IDEA: {
    picture taking item, maps picture to 2d plane by world edit
}

BOT PROBLEM:
i have an idea
i should make a chat verification render system
basically, for a chat message to show, it must contain an invisible key, then i can make custom messages for vanilla actions, so messages like beds still show
that'll make it so mutes can work for any chat type, regardless of origin
and for the actual user bots, i have a good idea for those as well, i should try .remove() on them, which doesnt work on players (confirmed on thrices that fakeplayers can bypass player amount limits)
BOT INFO: 
    uses type 0 auth, minimal auth type
    the bots have no name or nametag properties
    "/join" dc command just joins the player
    What you can check server‑side:
        Xbox Live token validity
        Minecraft access token validity
        Profile signature validity
        Skin/cape signature validity
        UUID ↔ token binding


splashs client:
    esp
    killaura / triggerbot / pvp stuff
    anti-spam
    external spam
    nuker (i dont think it works)


IDEAS:
clean up option
announcement system
leaderboards
tags to have pariticles
cosmetics system

for misty:
crates
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
Killaura: an invisible floating text that follows behind each players head rotation and if a player hits it (normals cant cause the text is behind them), they get flagged
NoPacket
Block Reach: 1
Tower
Entity Fly
Entity Jesus
Entity Speed
HitBox
Kill Aura: 1
.give: yeah idk, maybe check for nearby items? (that method wouldnt work with /give)

FAKE PLAYERS:
    spleef mode
    chest mover mode
    

UIS:
    darko - server transfer ui
    
CLIENT DEFS:
    L1: Injection clients (user sided)
        inject using dlls into mc, changes packets sent

    L2: Proxy clients (bridge sided)
        connects to an external server
        has a fatal flaw (atleast lumine has it)

    L2.1: Bots (bridge sided)
        does not connect to an external server, but does change how the connection works compared to normal clients
        predictable names are easy to protect against, unpredictable ones arent
        may use subsessions

    L3: OP exploit (unknown)
        its only happened twice
        borealjam was involved in both
        theres no name or nametag with the user




