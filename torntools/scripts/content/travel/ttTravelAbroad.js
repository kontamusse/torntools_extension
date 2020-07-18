window.addEventListener('load', async (event) => {
    console.log("TT - Travel (abroad)");

    if(await flying() || !(await abroad())){
        return;
    }

    if(settings.pages.travel.profits && subpage("main")){
        displayItemProfits(itemlist.items);
        addFillMaxButtons();
    }

    if(subpage("main") && !doc.find(".info-msg-cont.red")){
        updateYATAprices();
    }

    if(getSearchParameters().page == "people"){
        playersLoaded(".users-list").then(function(){
            let list = doc.find(".users-list");
            let title = list.previousElementSibling;
    
            addFilterToTable(list, title);
        });
    }
});


function displayItemProfits(itemlist){
    let market = doc.find(".travel-agency-market");

    if(!market){
        console.log("No market");
        return;
    }

    // Table heading
    let headings = market.find(".items-list-title");
    let profit_heading = doc.new("div");
        profit_heading.innerText = "Profit";
        profit_heading.setClass("tt-travel-market-heading title-green");

    headings.insertBefore(profit_heading, headings.find(".stock-b"));

    // Table content
    let rows = doc.findAll(".users-list>li");
    for(let row of rows){
        let id = parseInt(row.find(".item img").getAttribute("src").split("items/")[1].split("/")[0]);
        let market_price = parseInt(itemlist[id].market_value);
        let buy_price = parseInt(row.find(".cost .c-price").innerText.replace("$", "").replace(/,/g, ""));
        let profit = (market_price/buy_price*100).toFixed(0);

        let span = doc.new("span");
            span.setClass("tt-travel-market-cell")
        let inner_span = doc.new("span");
            inner_span.innerText = `${profit}%`;

        let triangle_div = doc.new("div");
            triangle_div.setClass("tt-travel-price-indicator");

        if(buy_price > market_price){
            span.style.color = "#de0000";
            triangle_div.style.borderTop = "8px solid #de0000";
        } else if( buy_price < market_price){
            span.style.color = "#00a500";
            triangle_div.style.borderBottom = "8px solid #00a500"
        }

        inner_span.appendChild(triangle_div);
        span.appendChild(inner_span);
        row.find(".item-info-wrap").insertBefore(span, row.find(".item-info-wrap").find(".stock"));
    }
}

function addFillMaxButtons(){
    let market = doc.find(".travel-agency-market");

    if(!market){
        console.log("No market");
        return;
    }

    for(let buy_btn of market.findAll(".buy")){
        let max_span = doc.new({type: "span", text: "fill max", class: "tt-max-buy bold"});
        buy_btn.parentElement.appendChild(max_span);

        max_span.addEventListener("click", function(event){
            event.stopPropagation();

            let max = parseInt(buy_btn.parentElement.parentElement.find(".stck-amount").innerText.replace(/,/g, ""));
            let price = parseInt(buy_btn.parentElement.parentElement.find(".c-price").innerText.replace(/,/g, "").replace("$",""));
            let user_money = doc.find(".user-info .msg .bold:nth-of-type(2)").innerText.replace(/,/g, "").replace("$","");
            let bought = parseInt(doc.find(".user-info .msg .bold:nth-of-type(3)").innerText);
            let limit = parseInt(doc.find(".user-info .msg .bold:nth-of-type(4)").innerText) - bought;
            
            max = max > limit ? limit:max;
            max = Math.floor(user_money/price) < max ? Math.floor(user_money/price) : max;
            
            console.log(buy_btn.parentElement.find("input[name='amount']"))
            buy_btn.parentElement.find("input[name='amount']").value = max;
            buy_btn.parentElement.find("input[name='amount']").setAttribute("value", max);

            // for value to be accepted
            buy_btn.parentElement.find("input[name='amount']").dispatchEvent(new Event("blur"));
        });
    }

}

function updateYATAprices(){
    console.log("Updating YATA prices");

    let post_data = {
        "client": "TornTools",
        "version": chrome.runtime.getManifest().version,
        "author_name": "Mephiles",
        "author_id": 2087524,
        "country": getCountryName(),
        "items": []
    }

    // Table content
    let rows = doc.findAll(".users-list>li");
    for(let row of rows){
        let id = parseInt(row.find(".item img").getAttribute("src").split("items/")[1].split("/")[0]);
        let quantity = parseInt(row.find(".stck-amount").innerText.replace(/,/g, ""));
        let price = parseInt(row.find(".cost .c-price").innerText.replace("$", "").replace(/,/g, ""));

        // post_data.items[id] = {quantity: quantity, cost: price}
        post_data.items.push({
            id: id,
            quantity: quantity,
            cost: price
        });
    }

    console.log("POST DATA", post_data);
    fetch(`https://yata.alwaysdata.net/bazaar/abroad/import/`, {
        method: "POST", 
        headers: {"content-type": "application/json"}, 
        body: JSON.stringify(post_data)
    }).then(response => {
        console.log("RESPONSE", response);
    });

    function getCountryName(){
        return doc.find("#skip-to-content").innerText.slice(0, 3).toLowerCase();
    }
}

function subpage(type){
    let search = window.location.search;

    if(type == "main" && search == ""){
        return true;
    }

    if(search.indexOf(type) > -1){
        return true;
    }
    return false;
}

function addFilterToTable(list, title){
    let filter_container = content.new_container("Filters", {id: "tt-player-filter", class: "filter-container", next_element: title}).find(".content");
    filter_html = `
        <div class="filter-header">
            <div class="statistic" id="showing">Showing <span class="filter-count">X</span> of <span class="filter-total">Y</span> users</div>
        </div>
        <div class="filter-content ${mobile?"tt-mobile":""}">
            <div class="filter-wrap" id="activity-filter">
                <div class="filter-heading">Activity</div>
                <div class="filter-multi-wrap ${mobile? 'tt-mobile':''}">
                    <div class="tt-checkbox-wrap"><input type="checkbox" value="online">Online</div>
                    <div class="tt-checkbox-wrap"><input type="checkbox" value="idle">Idle</div>
                    <div class="tt-checkbox-wrap"><input type="checkbox" value="offline">Offline</div>
                </div>
            </div>
            <div class="filter-wrap" id="status-filter">
                <div class="filter-heading">Status</div>
                <div class="filter-multi-wrap ${mobile? 'tt-mobile':''}">
                    <div class="tt-checkbox-wrap"><input type="checkbox" value="okay">Okay</div>
                    <div class="tt-checkbox-wrap"><input type="checkbox" value="hospital">Hospital</div>
                    <!--<div class="tt-checkbox-wrap"><input type="checkbox" value="traveling">Traveling</div>-->
                </div>
            </div>
            <!--
            <div class="filter-wrap" id="faction-filter">
                <div class="filter-heading">Faction</div>
                <select name="faction" id="tt-faction-filter">
                    <option selected value="">none</option>
                </select>
            </div>
            -->
            <!--
            <div class="filter-wrap" id="time-filter">
                <div class="filter-heading">Time</div>
                <div id="tt-time-filter" class="filter-slider"></div>
                <div class="filter-slider-info"></div>
            </div>
            -->
            <div class="filter-wrap" id="level-filter">
                <div class="filter-heading">Level</div>
                <div id="tt-level-filter" class="filter-slider"></div>
                <div class="filter-slider-info"></div>
            </div>
        </div>
    `
    filter_container.innerHTML = filter_html;

    // Initializing
    // let time_start = filters.hospital.time[0] || 0;
    // let time_end = filters.hospital.time[1] || 100;
    let level_start = filters.overseas.level[0] || 0;
    let level_end = filters.overseas.level[1] || 100;

    // for(let faction of filters.preset_data.factions.data){
    //     let option = doc.new({type: "option", value: faction, text: faction});
    //     if(faction == filters.preset_data.factions.default) option.selected = true;

    //     filter_container.find("#tt-faction-filter").appendChild(option);
    // }
    // let divider_option = doc.new({type: "option", value: "----------", text: "----------", attributes: {disabled: true}});
    // filter_container.find("#tt-faction-filter").appendChild(divider_option);

    // Time slider
    // let time_slider = filter_container.find('#tt-time-filter');
    // noUiSlider.create(time_slider, {
    //     start: [time_start, time_end],
    //     step: 1,
    //     connect: true,
    //     range: {
    //         'min': 0,
    //         'max': 100
    //     }
    // });

    // let time_slider_info = time_slider.nextElementSibling;
    // time_slider.noUiSlider.on('update', function (values) {
    //     values = values.map(x => (time_until(parseFloat(x)*60*60*1000, {max_unit: "h", hide_nulls: true})));
    //     time_slider_info.innerHTML = `Time: ${values.join(' - ')}`;
    // });

    // Level slider
    let level_slider = filter_container.find('#tt-level-filter');
    noUiSlider.create(level_slider, {
        start: [level_start, level_end],
        step: 1,
        connect: true,
        range: {
            'min': 0,
            'max': 100
        }
    });

    let level_slider_info = level_slider.nextElementSibling;
    level_slider.noUiSlider.on('update', function (values) {
        values = values.map(x => parseInt(x));
        level_slider_info.innerHTML = `Level: ${values.join(' - ')}`;
    });

    // Event listeners
    for(let checkbox of filter_container.findAll(".tt-checkbox-wrap input")){
        checkbox.onclick = applyFilters;
    }
    for(let dropdown of filter_container.findAll("select")){
        dropdown.onchange = applyFilters;
    }
    let filter_observer = new MutationObserver(function(mutations){
        for(let mutation of mutations){
            if(mutation.type == "attributes" 
            && mutation.target.classList 
            && mutation.attributeName == "aria-valuenow"
            && (mutation.target.classList.contains("noUi-handle-lower") || mutation.target.classList.contains("noUi-handle-upper"))){
                applyFilters();
            }
        }
    });
    filter_observer.observe(filter_container, {attributes: true, subtree: true});

    // Page changing
    doc.addEventListener("click", function(event){
        if(event.target.classList && !event.target.classList.contains("gallery-wrapper") && hasParent(event.target, {class: "gallery-wrapper"})){
            console.log("click");
            setTimeout(function(){
                playersLoaded(".users-list").then(function(){
                    console.log("loaded");
                    // populateFactions();
                    applyFilters();
                });
            }, 300);
        }
    });

    // Initializing
    for(let state of filters.overseas.activity){
        doc.find(`#activity-filter input[value='${state}']`).checked = true;
    }
    for(let state of filters.overseas.status){
        doc.find(`#status-filter input[value='${state}']`).checked = true;
    }
    // if(filters.overseas.faction.default){
    //     doc.find(`#faction-filter option[value='${filters.overseas.faction}']`).selected = true;
    // }

    // populateFactions();
    applyFilters();
    
    function applyFilters(){
        let active_dict = {
            "online": "icon1_",
            "idle": "icon62_",
            "offline": "icon2_"
        }

        let activity = [];
        let status = [];
        // let faction = ``;
        // let time = [];
        let level = [];

        // Activity
        for(let checkbox of doc.findAll("#activity-filter .tt-checkbox-wrap input:checked")){
            activity.push(checkbox.getAttribute("value"));
        }
        // Status
        for(let checkbox of doc.findAll("#status-filter .tt-checkbox-wrap input:checked")){
            status.push(checkbox.getAttribute("value"));
        }
        // Faction
        // faction = doc.find("#faction-filter select option:checked").value;
        // Time
        // time.push(parseInt(doc.find("#time-filter .noUi-handle-lower").getAttribute("aria-valuenow")));
        // time.push(parseInt(doc.find("#time-filter .noUi-handle-upper").getAttribute("aria-valuenow")));
        // Level
        level.push(parseInt(doc.find("#level-filter .noUi-handle-lower").getAttribute("aria-valuenow")));
        level.push(parseInt(doc.find("#level-filter .noUi-handle-upper").getAttribute("aria-valuenow")));

        // console.log("Activity", activity);
        // console.log("Faction", faction);
        // console.log("Time", time);
        // console.log("Level", level);

        // Filtering
        for(let li of list.findAll(":scope>li")){
            li.classList.remove("filter-hidden");
            if(li.classList.contains("tt-user-info")){
                continue;
            } else if(li.nextElementSibling && li.nextElementSibling.classList.contains("tt-user-info")){
                li.nextElementSibling.classList.remove("filter-hidden");
            }

            // Level
            let player_level = parseInt(li.find(".level").innerText.trim().replace("LEVEL:", "").trim());
            if(!(level[0] <= player_level && player_level <= level[1])){
                li.classList.add("filter-hidden");
                continue;
            }

            // Time
            // let player_time = to_seconds(li.find(".time").innerText.trim().replace("Time:", "").replace("left:", "").trim())/60/60;
            // if(!(time[0] <= player_time && player_time <= time[1])){
            //     li.classList.add("filter-hidden");
            //     continue;
            // }

            // Activity
            let matches_one_activity = activity.length != 0? false:true;
            for(let state of activity){
                if(li.querySelector(`li[id^='${active_dict[state]}']`)){
                    matches_one_activity = true;
                }
            }
            if(!matches_one_activity){
                li.classList.add("filter-hidden");
                continue;
            }

            // Status
            let matches_one_status = status.length != 0? false:true;
            for(let state of status){
                if(li.find(`.status`).innerText.replace("STATUS:", "").trim().toLowerCase() == state){
                    matches_one_status = true;
                }
            }
            if(!matches_one_status){
                li.classList.add("filter-hidden");
                continue;
            }

            // Faction
            // if(faction != "" && (!li.find(`img[title='${faction}']`) && li.find(`a.user.faction`).innerText != faction)){
            //     li.classList.add("filter-hidden");
            //     continue;
            // }
        }

        local_storage.change({"filters": {"overseas": {
            activity: activity,
            status: status,
            // faction: faction,
            // time: time,
            level: level
        }}});

        updateStatistics();
    }

    function updateStatistics(){
        let total_users = [...list.findAll(":scope>li")].length;
        let shown_users = [...list.findAll(":scope>li")].filter(x => (!x.classList.contains("filter-hidden"))).length;

        doc.find(".statistic#showing .filter-count").innerText = shown_users;
        doc.find(".statistic#showing .filter-total").innerText = total_users;
    }

    function populateFactions(){
        let faction_tags = [...list.findAll(":scope>li")].map(x => (x.find(".user.faction img")? x.find(".user.faction img").getAttribute("title"):x.find("a.user.faction").innerText)).filter(x => x.trim() != "");

        for(let tag of faction_tags){
            if(filter_container.find(`#tt-faction-filter option[value='${tag}']`)) continue;

            let option = doc.new({type: "option", value: tag, text: tag});
            filter_container.find("#tt-faction-filter").appendChild(option);
        }
    }
}