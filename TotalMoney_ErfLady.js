// Github:   https://github.com/shdwjk/Roll20API/blob/master/TotalMana/TotalMana.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var TotalMana = TotalMana || (function() {
    'use strict';

    var version = '0.2.0 Arkum Erf Lady',
        lastUpdate = 1444830577,
        schemaVersion = 0.1,
        centerOfMap = 'CenterOfMap',
        verticalBiasUnit = 'CenterOf00.08',
        horizontalBiasUnit = 'CenterOf20.00',
        // Default bias values
        bias = {
            x0: 1270,
            y0: 861,
            y: 75.25,
            x: 63.55
        },

    checkInstall = function() {
        log('-=> TotalMana v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
        sendChat('','Reload scripts -=> TotalMana v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');


        if( ! _.has(state,'TotalMana') || state.TotalMana.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.TotalMana = {
                version: schemaVersion
            };
        }
    },
    
    //                    page=_.chain()
    //                        .map(function(o){
    //                            return getObj(o._type,o._id);
    //                        })
    //                        .reject(_.isUndefined)
    //                        .first()
    //                        .value()
    //                        .get('pageid');
    determineBias = function(msg) {
        var foundCapital = false,
            foundVerticalBiasUnit = false,
            foundHorizontalBiasUnit = false;
        _.reduce(findObjs({
            pageid: Campaign().get('playerpageid'),
            type: 'graphic',
            isdrawing: false,
            layer: 'gmlayer'
        }),function(m,t){
            
            if(t.get('name') == centerOfMap){
                bias.x0 = parseInt(t.get('left')) + parseInt(t.get('width')) / 2 ;
                bias.y0 = parseInt(t.get('top')) + parseInt(t.get('height')) / 2 ;           
                // sendChat('','Found '+ centerOfMap + '. Setting 00.00 position to (' + bias.x0 + ',' + bias.y0 + ')');
                foundCapital = true;
            }
            if(t.get('name') == verticalBiasUnit){
                var centerVertically = parseInt(t.get('top')) + parseInt(t.get('height')) / 2 ; 
                
                bias.y = (bias.y0 - centerVertically)/-8;

                // sendChat('','Found '+ verticalBiasUnit + ' at ('+ t.get('left') + ',' +  t.get('top') +'). Setting vertical bias to ' + bias.y );
                foundVerticalBiasUnit = true;
            }
            if(t.get('name') == horizontalBiasUnit){
                var centerHorizontally = parseInt(t.get('left')) + parseInt(t.get('width')) / 2 ; 
                
                bias.x = (bias.x0 - centerHorizontally)/-20;

                // sendChat('','Found '+ horizontalBiasUnit + ' at ('+ t.get('left') + ',' +  t.get('top') +'). Setting horizontal bias to ' + bias.x );
                foundHorizontalBiasUnit = true;
            }
            if(foundCapital && foundVerticalBiasUnit && foundHorizontalBiasUnit)
                return;
        },{}); 
        if(!foundCapital)
            sendChat('','[ERROR] Failed to find '+ centerOfMap + '! Pixel to Hex coordinates map will not work properly.');
        if(!foundVerticalBiasUnit)
            sendChat('','[ERROR] Failed to find '+ verticalBiasUnit + '! Pixel to Hex coordinates map will not work properly.');
        if(!foundHorizontalBiasUnit)
            sendChat('','[ERROR] Failed to find '+ horizontalBiasUnit + '! Pixel to Hex coordinates map will not work properly.');
    },
    
    isOdd = function(i) {
        if(i % 2 == 0) // is even
            return false;
        return true;
    },
    
    pixels2hexes = function(x,y) {
        var hexPositionVertical;
        var hexPositionHorizontal = Math.round((x - bias.x0) / bias.x);
        if(isOdd(hexPositionHorizontal)){
            hexPositionVertical = Math.round(((y - bias.y0)) / bias.y - 0.5);
        }else{
            hexPositionVertical = Math.round(((y - bias.y0)) / bias.y);
        }
        // sendChat('','y=' + y );
        
        return [hexPositionVertical, hexPositionHorizontal];
    },
    
    /*
        Inputs:
            - radius, string
    */
    setdim = function(msg,radius) {
        var m_obj = _.chain(msg.selected)  // Start a chain of the selected objects
            .map(function(s){
                return getObj('graphic',s._id);  // try to get each as a graphic (will be undefined for drawings, text, etc
            })
            .reject(_.isUndefined)  // Remove those selected objects that were not graphics (drawings, text, etc)                  
            .forEach(function(t){
                t.set('light_dimradius',radius);
                t.set('light_radius',radius);
                t.set('light_hassight','true');
        }); 
        
        sendChat('','Set selected tokens to dim light radius ' + radius + '.');
    },
    
    
    dead = function(msg) {
        var m_obj = _.chain(msg.selected)  // Start a chain of the selected objects
            .map(function(s){
                return getObj('graphic',s._id);  // try to get each as a graphic (will be undefined for drawings, text, etc
            })
            .reject(_.isUndefined)  // Remove those selected objects that were not graphics (drawings, text, etc)                  
            .forEach(function(o){
                o.set('showname',false);
                o.set('showplayers_name',true);
                o.set('bar1_value','');
                o.set('bar3_value','');
                o.set('status_red',false);
                o.set('status_green',false);
                o.set('status_pink',false);
                o.set('status_purple',false);
                o.set('controlledby','');
                o.set('light_radius','');
                o.set('light_dimradius','');
                o.set('tint_color','#000000');
                o.set('status_skull',true);
        });
                  
        sendChat('','Selected units are dead: set maintenance to 0, turn off Control by All, lighting, name; painted black, added skull marker.');                  
    },

    uncroak = function(msg) {
        var m_obj = _.chain(msg.selected)  // Start a chain of the selected objects
            .map(function(s){
                return getObj('graphic',s._id);  // try to get each as a graphic (will be undefined for drawings, text, etc
            })
            .reject(_.isUndefined)  // Remove those selected objects that were not graphics (drawings, text, etc)                  
            .forEach(function(o){
                o.set('showname',false);
                o.set('showplayers_name',true);
                o.set('bar1_value','');
                o.set('bar3_value','');
                o.set('status_red',false);
                o.set('status_green',false);
                o.set('status_pink',false);
                o.set('status_purple',false);
                o.set('controlledby','');
                o.set('light_radius','');
                o.set('light_dimradius','');
                o.set('tint_color','#000000');
                o.set('status_skull',false);
        });
                  
        sendChat('','Selected units are uncroaked: set maintenance to 0, turn off Control by All, lighting, name; painted black.');                  
    },
    
    upkeepPaid = function(msg) {
        var m_obj = _.chain(msg.selected)  // Start a chain of the selected objects
            .map(function(s){
                return getObj('graphic',s._id);  // try to get each as a graphic (will be undefined for drawings, text, etc
            })
            .reject(_.isUndefined)  // Remove those selected objects that were not graphics (drawings, text, etc)                  
            .forEach(function(o){
                if(o.get('tint_color') == 'transparent' && parseFloat(o.get('bar1_value')) < 0) 
                    o.set('tint_color','#00ff00');
                else
                    sendChat('','a unit does not have upkeep or is not tint transparent'); 
            });
      
        sendChat('','Selected units have upkeep paid: painted bright green.');                  
    },

    upkeepUnpaid = function(msg) {
        var m_obj = _.chain(msg.selected)  // Start a chain of the selected objects
            .map(function(s){
                return getObj('graphic',s._id);  // try to get each as a graphic (will be undefined for drawings, text, etc
            })
            .reject(_.isUndefined)  // Remove those selected objects that were not graphics (drawings, text, etc)                  
            .forEach(function(o){
                if(o.get('tint_color') == '#00ff00' && parseFloat(o.get('bar1_value')) < 0) 
                    o.set('tint_color','transparent');
                else
                    sendChat('','a unit does not have upkeep or is not tint green'); 
            });
      
        sendChat('','Selected units have upkeep not-paid: set tint color to transparent.');                  
    },

    
    fixLight = function(t) {
        var text = t.get('name') + ' at (' + parseInt(t.get('left')) + ',' + parseInt(t.get('top')) +  ')';
        sendChat('', text);
        if (t.get('bar1_value').isUndefined || t.get('bar1_value').isNaN || t.get('bar1_value')===''){
            // Doesn't have upkeep: do nothing
        }else if (t.get('light_radius').isUndefined || t.get('light_radius').isNaN || t.get('light_radius')===''){
            // Doesn't have a light radius: do nothing
        }else if (t.get('light_radius')==='3'){
            t.set('light_dimradius','30');
            t.set('light_radius','30');
        }else if (t.get('light_radius')==='8'){
            t.set('light_dimradius','80');
            t.set('light_radius','80');
        }else if (t.get('light_radius')==='16'){
            t.set('light_dimradius','160');
            t.set('light_radius','160');
        }else if (t.get('light_radius')==='22'){
            t.set('light_dimradius','220');
            t.set('light_radius','220');
        //}else if (t.set('light_radius')==='30'){ // so it doesn't conflict with the 3
        //    t.set('light_dimradius','300');
        //    t.set('light_radius','220');
        }else if (t.get('light_radius')==='38'){
            t.set('light_dimradius','380');
            t.set('light_radius','380');
        }else if (t.get('light_radius')==='44'){
            t.set('light_dimradius','440');
            t.set('light_radius','440');
        }else if (t.get('light_radius')==='52'){
            t.set('light_dimradius','520');
            t.set('light_radius','520');
        }else if (t.get('light_radius')==='1000'){
            t.set('light_dimradius','1');
            t.set('light_radius','10000');
        }
    },
    
    padHexNumber = function(h) {
        if(h>=10 || h<=-10){
            return h;
        }
        if(h>=0){
            return '0'+h;
        }
        if(h<0){
            return '-0'+(-h);
        }
        
    },
    
    handleInput = function(msg) {
        var args,
            page,
            totals;

        if (msg.type !== "api") {
            return;
        }

        args = msg.content.split(/\s+/);
        switch(args[0]) {
            case '!total-mana':
            case '!total-money':
                sendChat('','Starting this command, total-money')
                if(msg.selected){
                    page=_.chain(msg.selected)
                            .map(function(o){
                                return getObj(o._type,o._id);
                            })
                            .reject(_.isUndefined)
                            .first()
                            .value()
                            .get('pageid');

                } else {
                    page=Campaign().get('playerpageid');
                }

                totals = _.reduce(findObjs({
                    pageid: page,
                    type: 'graphic',
                    isdrawing: false,
                    layer: 'objects'
                }),function(m,o){
                    
                    var x = parseInt(o.get('left'));
                    var y = parseInt(o.get('top'));
                    var [hy, hx] = pixels2hexes(x,y);
                    // var nameStr = o.get('name') + ' at (' + x + ',' + y + ' hex ' + padHexNumber(hx) + '.'+ padHexNumber(hy) + ')';
                    var nameStr = 'Hex '  + padHexNumber(hx) + '.'+ padHexNumber(hy) + ' ' + o.get('name');
                    
                    m.bar2+=parseFloat(o.get('bar2_value')) || 0; // Blue : treasury spenditures

                    // Summing up positive Upkeep into upkeepIncome
                    //if ( parseInt(o.get('bar1_value')) > 0) {
                    //    if(o.get("status_red")){
                    //        m.upkeepIncome+=Math.ceil(parseFloat(o.get('bar1_value')*1.1)) || 0;
                    //        sendChat('', o.get('name') + ' at (' + parseInt(o.get('left')) + ',' + parseInt(o.get('top')) +  ') is managed! : ' + Math.ceil(parseFloat(o.get('bar1_value')*1.1) || 0));                        
                    //    }else if(o.get("status_pink")){
                    //        m.upkeepIncome+=Math.ceil(parseFloat(o.get('bar1_value')*1.2)) || 0;
                    //        sendChat('', o.get('name') + ' at (' + parseInt(o.get('left')) + ',' + parseInt(o.get('top')) +  ') is managed and has admin building! : ' + Math.ceil(parseFloat(o.get('bar1_value')*1.2) || 0));                        
                    //    }else{
                    //        m.upkeepIncome+=parseFloat(o.get('bar1_value')) || 0;
                    //    }
                    // Summing up negative Upkeep into upkeep
                    //}else 
                    if (parseFloat(o.get('bar1_value')) < 0) {
                        nameStr = nameStr + ' Upkeep ' + parseFloat(-o.get('bar1_value'));
                        if(o.get('tint_color') == '#00ff00') {
                            nameStr = nameStr + ' (paid)';
                        }
                        else {
                            m.upkeepAfterRations+=parseFloat(o.get('bar1_value')) || 0; // Green : Upkeep
                        }
                        m.upkeep+=parseFloat(o.get('bar1_value')) || 0; // Green : Upkeep
                    }
                    
                    if (parseFloat(o.get('bar1_value')) > 0) {
                        nameStr = nameStr + ' Income ' + parseFloat(o.get('bar1_value'));
                    }                    
                    
                    //sendChat('',m.numberOfcities);
                    // Summming Port income only, managed and normal
                    if(''+o.get('name').indexOf( 'City' ) > -1 ) {
                        m.numberOfcities += 1; 
                        if(o.get("status_red")){
                            m.cityIncomeManaged+=Math.round(parseFloat(o.get('bar3_value'))+1000) || 0;
                            
                            nameStr = nameStr + ' (' + Math.round(parseFloat(o.get('bar3_value'))+1000) + ' managed)';
                        //}else if(o.get("status_pink")){
                        //    m.cityIncome+=Math.round(parseFloat(o.get('bar3_value')*1.2)) || 0;
                        //    sendChat('', o.get('name') + ' at (' + parseInt(o.get('left')) + ',' + parseInt(o.get('top')) +  ') is managed and has admin building! : ' + (parseInt(o.get('bar3_value')*1.2) || 0));                        
                        // }else{
                        //     sendChat('', nameStr + ' : ' + (parseFloat(o.get('bar3_value')) || 0));                        
                        }                        
                        m.cityIncome+=parseFloat(o.get('bar3_value')) || 0; // Red : Income
                    }
                    
                    sendChat('', nameStr);
                    
                    // Summing Trader Cog income only
                    //if(o.get('bar3_value')>0 && o.get('bar1_value')==-1 ){
                        //if(o.get("status_pink")){
                        //    m.tradingIncome+=parseFloat(o.get('bar3_value'))+50 || 0;
                        //    sendChat('', 'Trader ' + o.get('name') + ' with Trading Captain at (' + parseInt(o.get('left')) + ',' + parseInt(o.get('top')) +  ') : ' + (parseFloat(o.get('bar3_value'))+50 || 0));                        
                        //}else{
                    //    m.tradingIncome+=parseFloat(o.get('bar3_value')) || 0;
                    //    sendChat('', 'Trader ' + o.get('name') + ' at (' + parseInt(o.get('left')) + ',' + parseInt(o.get('top')) +  ') : ' + (parseFloat(o.get('bar3_value')) || 0));                        
                        //}
                    //}
                    
                    //log(o.get('_id'));
                    // Setting value at Treasury
                    if((''+o.get('name')).indexOf( 'Treasury' ) > -1) {
                        m.treasury+=parseFloat(o.get('bar3_value')) || 0;
                        //if(o.get("status_yellow")){
                        //    m.bananaSpell = true;
                        //}
                        //if(o.get("status_blue")){
                        //    m.bucketOfCash = true;
                        //}
                        //if(o.get("status_pink")){
                        //     m.tradingIncome+=1000 || 0; // with tower this is increased, so chucks..
                        //}
                    // Add up all red numbers : setting totalIncome
                    }else{
                        if(o.get("status_red")){ // Only managed ports should have red symbold
                            m.totalIncome+=Math.round(parseFloat(o.get('bar3_value'))+1000 || 0); // Red : Income
                            // Only managed ports should have red symbold
                            if(''+o.get('name').indexOf( 'City' ) <= -1 ) {
                                sendChat('', 'Whos THIS with a red symbol?? Only managed Ports should have red dot. ' + o.get('name') + ' at (' + parseInt(o.get('left')) + ',' + parseInt(o.get('top')) +  ') : ' + (parseFloat(o.get('bar3_value')) || 0));                        
                            }
                        //}else if(o.get("status_pink")){
                        //    m.totalIncome+=Math.round(parseFloat(o.get('bar3_value'))+1000 || 0); // Red : Income
                        }else{
                            m.totalIncome+=Math.round(parseFloat(o.get('bar3_value')) || 0); // Red : Income
                        }
                    }
                    
                    //if(o.get('name') == 'Farm' || o.get('name') == 'Mine' ) {
                    //    m.resourceIncome+=parseFloat(o.get('bar3_value')) || 0;
                    //    m.numberOfresources += 1; 
                        //sendChat('', 'Resource'+m.numberOfresources + ' ' + o.get('name') + ' at (' + parseInt(o.get('left')) + ',' + parseInt(o.get('top')) +  ') = ' + (parseFloat(o.get('bar3_value')) || 0));
                    //}

                    //sendChat('',' ' + m.numberOfcities);
                    return m;
                },{ upkeepAfterRations: 0, cityIncomeManaged: 0, tradingIncome: 0, totalIncome: 0, upkeep: 0, upkeepIncome: 0, bar2: 0, cityIncome: 0,  numberOfcities: 0, numberOfresources: 0, treasury: 0, resourceIncome: 0, bananaSpell: false, bucketOfCash: false}); // this is where you initialize fields

                // var totalIncomeCities = Math.floor( totals.cityIncome*(Math.pow(0.95,totals.numberOfcities-3) ) ); // Math.max(totals.numberOfcities-3 , 0)
                var totalIncomeCities = totals.cityIncome; 
                var totalRawIncome = totalIncomeCities + totals.resourceIncome;
                var magicalIncome = 0;
                //if(totals.bucketOfCash){
                //    var bucketIncome = Math.floor( Math.min(totalRawIncome*0.075 , 1000) );
                //    sendChat('','Moneymancer Bucket of Cash Spell cast! Income increased 7.5%! (+' + parseInt(bucketIncome) + 's)');
                //    magicalIncome = magicalIncome + bucketIncome;
                //}
                //if(totals.bananaSpell){
                //    var bananaIncome = Math.floor( Math.min(totals.resourceIncome, 1000) );
                //    sendChat('','Dittomancer Banana Spell cast! Farm income doubled! (+' + parseInt(bananaIncome) + 's)');
                //    magicalIncome = magicalIncome + bananaIncome;
                //}
                var upkeepCost=totals.upkeep;
                //if(-totals.upkeep > totals.upkeepIncome){
                //    upkeepCost = (totals.upkeep + totals.upkeepIncome)*50;
                //}

                log('Trading income:' + totals.tradingIncome)
                sendChat('','<div style="border:1px solid #999; border-radius: 1em; padding: .5em; background-color: #ccc;">'+
                    '<div style="text-align: center; font-size: 1.3em; font-weight:bold; border-bottom: 2px solid #999; margin:.5em;">'+
                        'Money Totals'+
                    '</div>'+
                    '<div>'+
                        '<div style="float:left;font-weight:bold;margin-right: 1em;">Treas at beg of last tu:</div>'+
                        totals.treasury +
                    '</div>'+
                    '<div>'+
                        '<div style="float:left;font-weight:bold;margin-right: 1em;">Gifts - Expend last tu:</div>'+
                        totals.bar2 +
                    '</div>'+
                    '<div>'+
                        '<div style="float:left;font-weight:bold;margin-right: 1em;">Treas at end of last tu:</div>'+
                        Math.floor( totals.treasury + totals.bar2 ) + 
//                        ( Math.floor( totals.cityIncome*(Math.pow(0.95,totals.numberOfcities-3)) ) + totals.resourceIncome + totals.bar1+totals.treasury + totals.bar2) +
                    '</div>'+
                    //'<div>'+
                    //    '<div style="float:left;font-weight:bold;margin-right: 1em;">(Port Income:</div>'+ // number of cities should be lower capped at 3
                    //    totals.cityIncome + ')' +
                    //'</div>'+
//                    '<div>'+
//                        '<div style="float:left;font-weight:bold;margin-right: 1em;">(Trading Income:</div>'+ // number of cities should be lower capped at 3
//                        totals.tradingIncome + ')' +
//                    '</div>'+
                    '<div>'+
                        '<div style="float:left;font-weight:bold;margin-right: 1em;">Income </div>'+ // number of cities should be lower capped at 3
                        totals.cityIncome + ' (' + totals.cityIncomeManaged + ' managed)' +
                        //                        totals.bar3*(0.95^(totals.numberOfcities-3)) +
                    '</div>'+
                    //'<div>'+
                    //    '<div style="float:left;font-weight:bold;margin-right: 1em;">(number of cities:</div>'+
                    //    totals.numberOfcities +
                    //')</div>'+
                    //'<div>'+
                    //    '<div style="float:left;font-weight:bold;margin-right: 1em;">Upkeep:</div>'+
                    //    (-totals.upkeep) + "/" + totals.upkeepIncome  +
                    //'</div>'+
                    '<div>'+
                        '<div style="float:left;font-weight:bold;margin-right: 1em;">Upkeep </div>'+
                        -totals.upkeep + ' (' + -totals.upkeepAfterRations + ' after rations)' + 
                    '</div>'+
                    '<div>'+
                        '<div style="float:left;font-weight:bold;margin-right: 1em;">Treasury</div>'+
                        (  totals.totalIncome + totals.upkeepAfterRations +totals.treasury+ totals.bar2 ) +
                    '</div>'+
                    //'<div>'+
                    //    '<div style="float:left;font-weight:bold;margin-right: 1em;">Treasury: </div>'+
                    //   totals.treasury + '(last T) ' + '-' + totals.treasury + '=' + Math.floor( totals.treasury + totals.bar2 ) + ' (end) ' + 
                    //'</div>'+
                '</div>'
                +'Dont forget to update the Treasury value, and set spenditures to zero now'
                );
                break;
                
            case '!names2GMnotes':
                
                _.reduce(findObjs({
                    pageid: Campaign().get('playerpageid'),
                    type: 'graphic',
                    isdrawing: false,
                    layer: 'objects'
                }),function(m,o){
                    o.set('gmnotes',o.get('name'));
                },{}); 
               
                sendChat('','Text in nameplate copied to GM notes.');
                break;

            case '!maint2names':
                
                _.reduce(findObjs({
                    pageid: Campaign().get('playerpageid'),
                    type: 'graphic',
                    isdrawing: false,
                    layer: 'objects'
                }),function(m,o){
                    if (o.get('bar1_value')===""){
                        // if no maintenance value do nothing
                    }else if(o.get('gmnotes')===""){
                        // if unamed unit, just copy in the bar1 value
                        o.set('name',o.get('bar1_value'));
                        o.set('showname',true);
                        o.set('showplayers_name',true);
                    }else{ 
                        // if named unit add name and value after a space
                        o.set(
                            'name',
                            o.get('gmnotes').replace(
                                /%([0-9A-Fa-f]{1,2})/g,
                                function(f,n){
                                    return String.fromCharCode(parseInt(n,16));
                                }
                            )
                        );
                        o.set('name',o.get('name') + ' ' + o.get('bar1_value'));
                        o.set('showname',true);
                        o.set('showplayers_name',true);
                    }
                },{}); 
               
                sendChat('','Maintenance values copied to nameplates, and nameplates turned on');
                break;

            case '!names-on':

                _.reduce(findObjs({
                    pageid: Campaign().get('playerpageid'),
                    type: 'graphic',
                    isdrawing: false,
                    layer: 'objects'
                }),function(m,o){
                    if(o.get('gmnotes')===""){
                        // do nothing
                    }else{ 
                        o.set('showname',true);
                        o.set('showplayers_name',true);
                    }
                },{}); 
                
                sendChat('','Nameplates of names with text in gmnotes turned on.');
                break;
                
            case '!names-off':

                _.reduce(findObjs({
                    pageid: Campaign().get('playerpageid'),
                    type: 'graphic',
                    isdrawing: false,
                    layer: 'objects'
                }),function(m,o){
                    o.set('showname',false);
                    o.set('showplayers_name',false);
                },{}); 
                
                sendChat('','All nameplates turned off.');
                break;

            case '!selected-names-off':

                var m_obj = _.chain(msg.selected)  // Start a chain of the selected objects
                  .map(function(s){
                    return getObj('graphic',s._id);  // try to get each as a graphic (will be undefined for drawings, text, etc
                  })
                  .reject(_.isUndefined)  // Remove those selected objects that were not graphics (drawings, text, etc)                  
                  .reduce(function(m,o){
                    o.set('showname',false);
                },{}); 
                
                sendChat('','Nameplates of selected units turned off.');
                break;

            case '!selected-names-on':

                var m_obj = _.chain(msg.selected)  // Start a chain of the selected objects
                  .map(function(s){
                    return getObj('graphic',s._id);  // try to get each as a graphic (will be undefined for drawings, text, etc
                  })
                  .reject(_.isUndefined)  // Remove those selected objects that were not graphics (drawings, text, etc)                  
                  .reduce(function(m,o){
                    o.set('showname',true);
                },{}); 
                
                sendChat('','Nameplates of selected units turned on.');
                break;

            case '!selected-money':
    
                var m_obj = _.chain(msg.selected)  // Start a chain of the selected objects
                  .map(function(s){
                    return getObj('graphic',s._id);  // try to get each as a graphic (will be undefined for drawings, text, etc
                  })
                  .reject(_.isUndefined)  // Remove those selected objects that were not graphics (drawings, text, etc)                  
                  .reduce(function(m,t){
                    // Do something with the token t
                    //m += t.get('bar1_value');
                    /*log( 'name: '+t.get('name') + ' maintenance: ' + t.get('bar1_value') + 
                        ' m: ' // + getObj(t._type,t._id).get('bar3_value')
                    );*/
                    
                    
                    //log('t ' + t + ', m ' + m + ', t.get(bar1_value) ' + t.get('bar1_value') + ', m+t.get');
                    //log(m*1 + t.get('bar1_value'));
                    //log('parseFloats');
                    //log(parseFloat(m) + parseFloat(t.get('bar1_value')));
                    if (t.get('bar1_value').isUndefined || t.get('bar1_value').isNaN || t.get('bar1_value')===''){
                        // Do nothing
                    }else{
                        m = parseFloat(m) + parseFloat(t.get('bar1_value'));
                        log(parseFloat(t.get('bar1_value')) + ' ' + t.get('bar1_value'));
                    }
                    return parseFloat(m);
                  },0)
                  .value();
                  
                //log('m_obj.m ' + m_obj.m + ' m_obj ' + m_obj + ' m_obj.value() ' + m_obj.value());  
                  
                sendChat('','Maintenance total of selected units: ' + ' ' + m_obj);
                  
                break;  

            case '!sca':
            case '!scall':
            case '!selected-control-all':
    
                var m_obj = _.chain(msg.selected)  // Start a chain of the selected objects
                  .map(function(s){
                    return getObj('graphic',s._id);  // try to get each as a graphic (will be undefined for drawings, text, etc
                  })
                  .reject(_.isUndefined)  // Remove those selected objects that were not graphics (drawings, text, etc)                  
                  .forEach(function(t){
                        t.set('controlledby','all');
                        t.set('showplayers_name',true);
                        t.set('playersedit_name',true);
                        t.set('showplayers_bar1',true);
                        t.set('showplayers_bar2',false);
                        t.set('showplayers_bar3',false);
                        t.set('playersedit_bar1',false);
                        t.set('playersedit_bar2',false);
                        t.set('playersedit_bar3',false);
                        t.set('playersedit_aura1',false);
                        t.set('playersedit_aura2',false);
                        t.set('tint_color','transparent');
                        t.set('light_hassight',true);
                        t.set('light_otherplayers',true);
                  });
                  
                  sendChat('','Set the selected units to be controled by all, and "see name", "edit name", "see bar 1", "see bar 3", tint color transparent.');                  
                break;  

            case '!stol':
            case '!selected-turn-off-light':
    
                var m_obj = _.chain(msg.selected)  // Start a chain of the selected objects
                  .map(function(s){
                    return getObj('graphic',s._id);  // try to get each as a graphic (will be undefined for drawings, text, etc
                  })
                  .reject(_.isUndefined)  // Remove those selected objects that were not graphics (drawings, text, etc)                  
                  .forEach(function(o){
                        // o.set('name',o.get('bar1_value'));
                        o.set('light_radius','');
                        o.set('light_dimradius','');
                  });
                  
                  //sendChat('','Selected units are Scouted, put maintenance in name, set maintenance to 0, turn off Control by All.');                  
                  sendChat('','Selected units turned off light.');                  
                break;  

            case '!v':
            case '!volcano':

                _.reduce(findObjs({
                    pageid: Campaign().get('playerpageid'),
                    type: 'graphic',
                    isdrawing: false,
                    layer: 'objects'
                }),function(m,t){
                    if (t.get('bar1_value').isUndefined || t.get('bar1_value').isNaN || t.get('bar1_value')===''){
                        // Doesn't have upkeep: do nothing
                    }else if (t.get('light_radius').isUndefined || t.get('light_radius').isNaN || t.get('light_radius')===''){
                        // Doesn't have a light radius: do nothing
                    }else if (t.set('light_radius')==='1000'){
                        // Tresure chest: do nothing
                    }else{ 
                        t.set('light_dimradius','30');
                        t.set('light_radius','30');
                    }
                },{}); 
                
                sendChat('','Set all units that have upkeep, except chest, to light radius 30.');
                break;

            case '!fl':
            case '!fix-light':

                _.reduce(findObjs({
                    pageid: Campaign().get('playerpageid'),
                    type: 'graphic',
                    isdrawing: false,
                    layer: 'objects'
                }),function(m,t){
                    fixLight(t);
                },{}); 
                
                sendChat('','Set all units that have upkeep, to 10x light radius.');
                break;
                
            case '!sfl':
            case '!selected-fix-light':
    
                var m_obj = _.chain(msg.selected)  // Start a chain of the selected objects
                  .map(function(s){
                    return getObj('graphic',s._id);  // try to get each as a graphic (will be undefined for drawings, text, etc
                  })
                  .reject(_.isUndefined)  // Remove those selected objects that were not graphics (drawings, text, etc)                  
                  .forEach(function(o){
                    fixLight(o);
                  });
                  
                  sendChat('','Selected units that have upkeep, to 10x light radius.');                  
                break;                  

            case '!ssu':
            case '!selected-scout-units':
    
                var m_obj = _.chain(msg.selected)  // Start a chain of the selected objects
                  .map(function(s){
                    return getObj('graphic',s._id);  // try to get each as a graphic (will be undefined for drawings, text, etc
                  })
                  .reject(_.isUndefined)  // Remove those selected objects that were not graphics (drawings, text, etc)                  
                  .forEach(function(o){
                        // o.set('name',o.get('bar1_value'));
                        o.set('showname',false);
                        o.set('showplayers_name',true);
                        o.set('bar1_value','');
                        o.set('bar3_value','');
                        o.set('status_red',false);
                        o.set('controlledby','');
                        o.set('light_radius','');
                        o.set('light_dimradius','');
                  });
                  
                  //sendChat('','Selected units are Scouted, put maintenance in name, set maintenance to 0, turn off Control by All.');                  
                  sendChat('','Selected units are Scouted: set maintenance to 0, turn off Control by All, lighting, name.');                  
                break;  


            case '!ssub':
            case '!ssublack':
            case '!selected-scout-units-black':
    
                var m_obj = _.chain(msg.selected)  // Start a chain of the selected objects
                  .map(function(s){
                    return getObj('graphic',s._id);  // try to get each as a graphic (will be undefined for drawings, text, etc
                  })
                  .reject(_.isUndefined)  // Remove those selected objects that were not graphics (drawings, text, etc)                  
                  .forEach(function(o){
                        // o.set('name',o.get('bar1_value'));
                        o.set('showname',false);
                        o.set('showplayers_name',true);
                        o.set('bar1_value','');
                        o.set('bar3_value','');
                        o.set('status_red',false);
                        o.set('status_green',false);
                        o.set('status_pink',false);
                        o.set('status_purple',false);
                        o.set('controlledby','');
                        o.set('light_radius','');
                        o.set('light_dimradius','');
                        o.set('tint_color','#000000');
                  });
                  
                  //sendChat('','Selected units are Scouted, put maintenance in name, set maintenance to 0, turn off Control by All.');                  
                  sendChat('','Selected units are Scouted: set maintenance to 0, turn off Control by All, lighting, name; painted grey.');                  
                break;  

            case '!ssur':
            case '!selected-scout-units-red':
                var m_obj = _.chain(msg.selected)  // Start a chain of the selected objects
                  .map(function(s){
                    return getObj('graphic',s._id);  // try to get each as a graphic (will be undefined for drawings, text, etc
                  })
                  .reject(_.isUndefined)  // Remove those selected objects that were not graphics (drawings, text, etc)                  
                  .forEach(function(o){
                        // o.set('name',o.get('bar1_value'));
                        o.set('showname',false);
                        o.set('showplayers_name',true);
                        o.set('bar1_value','');
                        o.set('bar3_value','');
                        o.set('status_red',false);
                        o.set('status_green',false);
                        o.set('status_pink',false);
                        o.set('status_purple',false);
                        o.set('controlledby','');
                        o.set('light_radius','');
                        o.set('light_dimradius','');
                        o.set('tint_color','#ff0000');
                        //o.set('status_red',true);
                  });
                  
                  //sendChat('','Selected units are Scouted, put maintenance in name, set maintenance to 0, turn off Control by All.');                  
                  sendChat('','Selected units are Scouted: set maintenance to 0, turn off Control by All, lighting, name; painted red.');                  
                break;  

            case '!ssup':
            case '!selected-scout-units-purple':
                var m_obj = _.chain(msg.selected)  // Start a chain of the selected objects
                  .map(function(s){
                    return getObj('graphic',s._id);  // try to get each as a graphic (will be undefined for drawings, text, etc
                  })
                  .reject(_.isUndefined)  // Remove those selected objects that were not graphics (drawings, text, etc)                  
                  .forEach(function(o){
                        o.set('showname',false);
                        o.set('showplayers_name',true);
                        o.set('bar1_value','');
                        o.set('bar3_value','');
                        o.set('status_red',false);
                        o.set('status_green',false);
                        o.set('status_pink',false);
                        o.set('status_purple',false);
                        o.set('controlledby','');
                        o.set('light_radius','');
                        o.set('light_dimradius','');
                        o.set('tint_color','#9900ff');
                  });
                  
                  //sendChat('','Selected units are Scouted, put maintenance in name, set maintenance to 0, turn off Control by All.');                  
                  sendChat('','Selected units are Scouted: set maintenance to 0, turn off Control by All, lighting, name; painted red.');                  
                break;  
        
            case '!dead':
                dead(msg);
                break;

            case '!u':
            case '!uncroak':
                uncroak(msg);
                break;

            case '!up':
            case '!upkeep-paid':
                upkeepPaid(msg);
                break;

            case '!uu':
            case '!upkeep-unpaid':
                upkeepUnpaid(msg);
                break;

            case '!selected-green-on':
    
                var m_obj = _.chain(msg.selected)  // Start a chain of the selected objects
                  .map(function(s){
                    return getObj('graphic',s._id);  // try to get each as a graphic (will be undefined for drawings, text, etc
                  })
                  .reject(_.isUndefined)  // Remove those selected objects that were not graphics (drawings, text, etc)                  
                  .forEach(function(t){
                        t.set('status_green',true);
                  });
                  
                  sendChat('','Turned ON the Green marker on selected units.');                  
                break;  

            case '!selected-green-off':
    
                var m_obj = _.chain(msg.selected)  // Start a chain of the selected objects
                  .map(function(s){
                    return getObj('graphic',s._id);  // try to get each as a graphic (will be undefined for drawings, text, etc
                  })
                  .reject(_.isUndefined)  // Remove those selected objects that were not graphics (drawings, text, etc)                  
                  .forEach(function(t){
                        t.set('status_green',false);
                  });
                  
                  sendChat('','Turned OFF the Green marker on selected units.');                  
                break;  

            case '!control-all':

                _.reduce(findObjs({
                    pageid: Campaign().get('playerpageid'),
                    type: 'graphic',
                    isdrawing: false,
                    layer: 'objects'
                }),function(m,o){
                    o.set('controlledby','all');
                    o.set('showplayers_bar1',true);
                    o.set('showplayers_bar2',true);
                    o.set('showplayers_bar3',true);
                    o.set('playersedit_bar1',false);
                    o.set('playersedit_bar2',false);
                    o.set('playersedit_bar3',false);
                }); 
                
                sendChat('','All tokens set to "Controled by all Players, but unable to edit the bar values".');
                break;

            case '!sd3':
            case '!setdim3':
                setdim(msg,'30');
                break;

            case '!sd8':
            case '!setdim8':
                setdim(msg,'80');
                break;

            case '!sd16':
            case '!setdim16':
                setdim(msg,'160');
                break;

            case '!sd22':
            case '!setdim22':
                setdim(msg,'220');
                break;

            case '!sdt2':
                setdim(msg,'300');
                break;

            case '!sdt3':
                setdim(msg,'380');
                break;

            case '!sdt4':
                setdim(msg,'440');
                break;

            case '!sdt5':
                setdim(msg,'520');
                break;

            case '!copy2GMlayer':
                _.reduce(findObjs({
                    pageid: Campaign().get('playerpageid'),
                    type: 'graphic',
                    isdrawing: false,
                    layer: 'objects'
                }),function(m,obj){

                    if(obj.get('name') == 'Farm' || obj.get('name') == 'Mine' 
                        || obj.get('name') == 'City' || (''+obj.get('name')).indexOf( 'Treasury' ) > -1){
                            // Do nothing, don't copy
                    }
                    else{
                        log('obj ' + obj.get("name") + ' ' + obj.get("gmnotes"));
                        createObj("graphic", {
                            name: obj.get("name"),
                            gmnotes: obj.get("gmnotes"),
            				left: obj.get("left"),
        					top: obj.get("top"),
        					width: obj.get("width"),
        					height: obj.get("height"),
        					bar1_value: obj.get("bar1_value"),
        					imgsrc: obj.get("imgsrc"),
        					pageid: obj.get("pageid"),
        					layer: "gmlayer"
        					});
                            
                    }
                    
                }); 

                sendChat('','Copied all tokens to GM layer.');
                break;

            case '!move':
/*                totals = _.reduce(findObjs({
                    pageid: page,
                    type: 'graphic',
                    isdrawing: false,
                    layer: 'objects'
                }),function(m,o){
                    if(o.get('name') == 'Schooner 2' ) {
                        sendPing(o.get("left"), o.get("top"), Campaign().get('playerpageid'), null, true);
                        sendChat('','Pinging and moving all players to ' + o.get("left") + ' ' + o.get("top") + '.');
                        return;    
                    }
                }
                break;
*/
            case '!movestatic':
                
/*                var capital = getObj("graphic", msg.selected.id);
                if(undefined != capital) {
                    sendPing(capital.get("left"), capital.get("top"), Campaign().get('playerpageid'), null, true);
                    sendChat('','Pinging and moving all players to ' + capital.get("left") + ' ' + capital.get("top") + '.');
                }else{ */
                //    sendPing(500, 500, Campaign().get('playerpageid'), null, true); 
                //    sendChat('','Pinging and moving all players.');
                break;

            default:
                sendChat('','Available commands:');
                sendChat('','. !total-money');
                //sendChat('','. !names2GMnotes');
                //sendChat('','. !maint2names');
                //sendChat('','. !names-on');
                //sendChat('','. !names-off');
                sendChat('','. !selected-names-on');
                sendChat('','. !selected-names-off');
                sendChat('','. !selected-money');
                sendChat('','. !u or !uncroak - that makes selected units painted black without skull symbol, and zero upkeep');
                sendChat('','. !dead - that makes selected units be painted black and with a skull symbol, and zeros their upkeep');
                sendChat('','. !up or !upkeep-paid - that makes selected units be painted green which ignores their upkeep on !total-money command');
                sendChat('','. !uu or !upkeep-unpaid - that makes selected units tint transparent');
                //sendChat('','. !selected-scout-units');
                //sendChat('','. !selected-control-all');
                //sendChat('','. !control-all : Give control of all tokens to all players');
                //sendChat('','. !copy2GMlayer');

        }
    },

    registerEventHandlers = function() {
        on('chat:message', handleInput);
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers,
        DetermineBias: determineBias,
        Pixels2hexes: pixels2hexes,
        IsOdd: isOdd
    };
    
}());

on('ready',function() {
    'use strict';

    TotalMana.CheckInstall();
    TotalMana.RegisterEventHandlers();
    TotalMana.DetermineBias();
    // if(TotalMana.IsOdd(-3))  log("is odd"); else log("is even");
    // if(TotalMana.IsOdd(-2)) log("is odd"); else log("is even");
    // if(TotalMana.IsOdd(-1)) log("is odd"); else log("is even");
    // if(TotalMana.IsOdd(0)) log("is odd"); else log("is even");
    // if(TotalMana.IsOdd(1)) log("is odd"); else log("is even");
    // if(TotalMana.IsOdd(2)) log("is odd"); else log("is even");
    // if(TotalMana.IsOdd(3)) log("is odd"); else log("is even");
    
});
