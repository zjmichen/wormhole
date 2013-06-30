#= require Canister
#= require Mine
#= require Missile
#= require Nuke

class Arsenal
    getArsenal: ->
        return 
            canister:
                item: Canister,
                rarity: 0.42,
            ,
            mine:
                item: Mine,
                rarity: 0.42,
            ,
            missile:
                item: Missile,
                rarity: 0.15,
            ,
            nuke:
                item: Nuke,
                rarity: 0.01,
