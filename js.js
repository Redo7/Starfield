// Copyright 2023 Redo Graphics. All rights reserved.
//
// Do not redistribute without obtaining explicit permission

let totalMessages = 0, messagesLimit = 0, removeSelector, removeUpdateSelector, provider, hideAfter, animationOut, displayPreview, fieldData, channelName;
let ignoredUsers = [];
const replyIcon = '<svg style="transform: scaleX(-1);" xmlns="http://www.w3.org/2000/svg" height="{{fontSize}}px" fill="var(--accent)" viewBox="0 96 960 960" width="{{fontSize}}px"><path d="M805.063 863.999q-17.755 0-31.37-13.624Q760.078 836.75 760.078 819V701q0-49.167-34.417-83.584t-83.584-34.417H282.229l110.924 111.925q13.308 13.146 13.308 30.995 0 17.85-14.391 32.241-13.609 13.609-31.493 13.609T329 758.076L146.231 575.307q-8.615-8.615-12.423-17.897-3.807-9.282-3.807-18.461 0-9.18 3.807-18.41 3.808-9.231 12.423-17.846L330 318.924q13.147-13.308 30.996-13.808 17.85-.5 32.241 13.891 13.608 13.609 13.608 31.493t-13.692 31.576L282.229 493.001h359.848q86.849 0 147.424 60.575Q850.076 614.15 850.076 701v118q0 17.75-13.629 31.375-13.628 13.624-31.384 13.624Z"/></svg>';

window.addEventListener('onWidgetLoad', function (obj) {
    fieldData = obj.detail.fieldData;
    messagesLimit = fieldData.msgLimit;
    animationIn = 'animate__' + fieldData.animationIn;
    animationOut = 'animate__' + fieldData.animationOut;
    hideAfter = fieldData.hideAfter;
  	displayPreview = fieldData.displayPreview;
  	channelName = obj.detail.channel.username;
  	checkForUpdatesOnWidgetLoad = fieldData.checkForUpdatesOnWidgetLoad;
    fetch('https://api.streamelements.com/kappa/v2/channels/' + obj.detail.channel.id + '/').then(response => response.json()).then((profile) => {
        provider = profile.provider;
    });
  
    removeSelector = ".chat-message:nth-last-child(n+" + (messagesLimit + 1) + ")";
  
    ignoredUsers = fieldData.ignoredUsers.toLowerCase().replaceAll(" ", "").split(",");
  
  	var updateStatus, updateClass;
    if (checkForUpdatesOnWidgetLoad === true) {
        fetch('https://raw.githubusercontent.com/Redo7/Starfield/main/data.json')
            .then(response => response.json()).then((output) => {
                if (output.widgetVersion > '{{widgetVersion}}') {
                    updateStatus = 'Widget update available. Download it from https://github.com/Redo7/Starfield/releases';
                  	updateClass = 'warning';
                } else {
                    updateStatus = 'Widget is up to date';
                  	updateClass = 'success';
                }
                const updateNotif = $.parseHTML(`<p class="update-notif ${updateClass} animate__{{animationIn}} animate__animated">${updateStatus}</p>`);
                $(updateNotif).appendTo('.main-container')
                $('.update-notif').delay(5000).queue(function () { $('.update-notif').addClass(animationOut).dequeue() }).delay(1000).queue(function () {
                    $(this).remove().dequeue()
                });
                $('.update-notif').animate({
                    height: 0,
                    opacity: 0
                }, 'slow', function () {
                    $('.update-notif').remove();
                });
            })
    }
});

window.addEventListener('onEventReceived', function (obj) {
	let event = obj['detail']['event'];
    let username = event['name'];
  	let amount = event['amount'];
  	let message = event['message'];
  	let alertIcon, alertContent;
  	let sound = new Audio('{{alertSound}}');
  	let soundVolume = '{{alertSoundVolume}}';
  
  	//Version Check
  
  	if (obj.detail.event.listener === 'widget-button') {
      	
        if (obj.detail.event.field === 'checkForUpdates') {
            
            var updateStatus, updateClass;
            fetch('https://raw.githubusercontent.com/Redo7/Starfield/main/data.json')
                .then(response => response.json()).then((output) => {
                    if (output.widgetVersion > '{{widgetVersion}}') {
                        updateStatus = 'Widget update available. Download it from https://github.com/Redo7/Starfield/releases';
                        updateClass = 'warning';
                    } else {
                        updateStatus = 'Widget is up to date';
                        updateClass = 'success';
                    }
                    const updateNotif = $.parseHTML(`<p class="update-notif ${updateClass} animate__{{animationIn}} animate__animated">${updateStatus}</p>`);
                    $(updateNotif).appendTo('.main-container');
                    $('.update-notif').delay(5000).queue(function () { $('.update-notif').addClass(animationOut).dequeue() }).delay(1000).queue(function () {
                        $(this).remove().dequeue()
                    });
                    $('.update-notif').animate({
                        height: 0,
                        opacity: 0
                    }, 'slow', function () {
                        $('.update-notif').remove();
                    });
                })

        }
    }
  
  	//Follower Alert
  
  	if (obj.detail.listener === 'follower-latest'){
      	alertContent = `${username} just followed!`;
        if ({{displayFollows}}) {
          addAlert('//Follower_alert', alertContent, `[evt/message: welcome!]`, sound, soundVolume);
        }
        return;
    }

    //Sub Alert

    if (obj.detail.listener === 'subscriber-latest') {
        let bulkGifted = event['bulkGifted'];
        let isCommunityGift = false;
        let gifted = false;
        isCommunityGift = event['isCommunityGift'];
        gifted = event['gifted'];
      
        if (isCommunityGift) { return };
        if (bulkGifted && {{displayBulkGifted}}) {
          	alertContent = `${username} gifted ${amount} subs!`;
          	addAlert('//Gifted_subs_alert', alertContent, `[evt/amount: x${amount}]`, sound, soundVolume);
        } else if (gifted && {{displayGifted}}) {
          	alertContent = `${event['sender']} gifted a sub to ${username} subscribed!`;
            addAlert('//Gifted_subscriber_alert', alertContent, `[evt/duration: ${amount}]`, sound, soundVolume);
        } else if (event['amount'] > 1 && {{displayResubs}}) {
          	alertContent = `${username} just subscribed!`;
            addAlert('//Subscriber_alert', alertContent, `[evt/duration: ${amount} months]`, sound, soundVolume);
        } else if ({{displaySubs}}) {
          	alertContent = `${username} just subscribed!`;
            addAlert('//Subscriber_alert', alertContent, `[evt/duration: ${amount} month]`, sound, soundVolume);
        }
        return;
    }

    //Donation Alert

    if (obj.detail.listener === 'tip-latest') {
      	let tipAmount;
        if('{{userCurrencyPosition}}' === 'left'){
           	tipAmount = '{{userCurrency}}' + event['amount'];
        } else {
           	tipAmount = event['amount'] + '{{userCurrency}}';
        }
      	
      	alertContent = `${username} donated ${tipAmount}`;
      
        if ({{displayDonations}} && event['amount'] >= '{{minDonationAmount}}') {
            addAlert('//Donation_alert', alertContent, `[evt/donation: ${tipAmount}]`, sound, soundVolume);
        }
        return;
    }

    //Cheer Alert

    if (obj.detail.listener === 'cheer-latest') { 
      	alertContent = `${username} cheered x${amount}!`;
      	if ({{displayCheers}} && event['amount'] >= '{{minCheerAmount}}') {
            addAlert('//Cheer_alert', alertContent, `[evt/cheer_amount: ${amount}]`, sound, soundVolume);
        }
        return;
    }

    //Raid Alert

    if (obj.detail.listener === 'raid-latest'){
      	alertContent = `${username} initiated a raid!`;
        if ({{displayRaids}}) {
          addAlert('//Raid_alert', alertContent, `[evt/raiders: ${amount}]`, sound, soundVolume);
        }
        return;
    }
  
  	//Deleting Messages

    if (obj.detail.listener === "delete-message") {
        const msgId = obj.detail.event.msgId;
        $(`.chat-message[data-msgid=${msgId}]`).remove();
        return;
    } else if (obj.detail.listener === "delete-messages") {
        const uId = obj.detail.event.userId;
        $(`.chat-message[data-sender=${uId}]`).remove();
        return;
    }

    //Message

    if (obj.detail.listener === "message") {
        let event = obj['detail']['event'];
        let data = event['data'];
        if (ignoredUsers.indexOf(data.nick) !== -1) return;
        let message = attachEmotes(data);
        let username = data['displayName'];
      	let emoteOnly = isEmote(data)
        let replyTo = null;
        let replyBody = null;
        let replyStyle = 'none';
        if (data.tags['reply-parent-display-name']) {
          replyTo = data.tags['reply-parent-display-name'];
          if (data.tags['reply-parent-msg-body'].length > 32) {
            replyBody = html_encode(data.tags['reply-parent-msg-body'].replaceAll("\\s", " ").substring(0, 50).concat('...'));
          } else {
            replyBody = html_encode(data.tags['reply-parent-msg-body'].replaceAll("\\s", " "));
          }
          replyStyle = 'flex';
        }
		
        //General Badges
        if ('{{displayBadges}}' === 'true') {
            var badges = "", badge;
            for (let i = 0; i < data.badges.length; i++) {
                badge = data.badges[i];
                badges += `<img alt="" src="${badge.url}" class="badge ${badge.type}-icon"> `;
            }
        } else {
            var badges = '';
        }
      
      	//Special Badges
      	let role = checkRole(data);
      	let userRole = role[0];
      	let roleIcon = role[1];
      	
      	//Pronouns
        let pronoun = null;
        let pronounStyle = null;

        const pronoun_api = fetch('https://pronouns.alejo.io/api/users/' + data.displayName.toLowerCase())
            .then((response) => response.json())
            .then((user) => {
                if (!user.length) {
                    return null;
                } else return user[0].pronoun_id;
            });

        const printAddress = async () => {
            pronoun = await pronoun_api;
            switch (pronoun) {
                case "aeaer":
                    pronoun = "ae/aer";
                    break;
                case "eem":
                    pronoun = "e/em";
                    break;
                case "faefaer":
                    pronoun = "fae/faer";
                    break;
                case "hehim":
                    pronoun = "he/him";
                    break;
                case "heshe":
                    pronoun = "he/she";
                    break;
                case "hethem":
                    pronoun = "he/they";
                    break;
                case "itits":
                    pronoun = "it/its";
                    break;
                case "perper":
                    pronoun = "per/per";
                    break;
                case "sheher":
                    pronoun = "she/her";
                    break;
                case "shethem":
                    pronoun = "she/they";
                    break;
                case "theythem":
                    pronoun = "they/them";
                    break;
                case "vever":
                    pronoun = "ve/ver";
                    break;
                case "xexem":
                    pronoun = "xe/xem";
                    break;
                case "ziehir":
                    pronoun = "zie/hir";
                    break;
                default:
                    break;
            }
            return pronoun;
        }

        printAddress().then(pronoun => addMessage(replyTo, replyBody, replyStyle, badges, username, pronoun, pronounStyle, message, data.userId, data.msgId, emoteOnly, userRole, roleIcon));
    }
});

function addMessage(replyTo, replyBody, replyStyle, badges, username, pronoun, pronounStyle, message, uId, msgId, isEmote, userRole, roleIcon) {
  	//Command Check
    if (message.startsWith("!") && '{{showCommands}}' === 'false') { return }
    else if (message.startsWith("@") && replyBody) {
        let messageNoTag = message.split(' ');
        messageNoTag.shift()
        message = messageNoTag.join(' ');
    }
  	//Emote Only Check
  	let emoteOnly;
  	if (isEmote) {
        emoteOnly = "emote-only"
    } else {
        emoteOnly = ""
    }
  	//Mentions Check
  	const mentions = message.match(/@\S+/g)
    if (mentions) {
        for (var i = 0; i < mentions.length; i++) {
            message = message.replace(mentions[i], `<p id="username" style="display: inline">${mentions[i]}</p>`)
        }
    }
  	//Badge Check
  	let badgeStyle;
  	if(badges === ''){
    	badgeStyle = 'display: none;';
    }
  	//Pronouns Display
    if ('{{displayPronouns}}' === 'false') {
        pronounStyle = 'display: none';
    } else if (pronoun == null) {
        pronounStyle = 'display: none';
    } else {
        pronounStyle = 'display: block';
    }
    totalMessages += 1;
  
    const element = $.parseHTML(`
		<div data-sender="${uId}" data-msgId="${msgId}" id="msg-${totalMessages}" class="chat-message ${userRole} animate__{{animationIn}} animate__animated {{chatTheme}}">
            <div class="reply" style="display: ${replyStyle}">
              <span style="opacity: .5; align-self: center;">${replyIcon}&nbsp;</span>
              <span>${replyTo}:</span>&nbsp;${replyBody}
            </div>
			<div class="message-box">
                <div class="user-role"><div class="user-role-ribbon ribbon-1"><p>.</p></div><div class="user-role-ribbon ribbon-2"><p>.</p></div><div class="user-role-ribbon ribbon-3"><p>.</p></div><div class="user-role-ribbon ribbon-4"><p>.</p></div></div>
                <div class="message-wrapper">
                    <div class="user-container flex-row">
                        <div class="user-box flex-row">
                            <p class="username">${username}</p>
                            <p class="separator" style="${pronounStyle}">•</p>
                            <p class="pronouns" style="${pronounStyle}">${pronoun}</p>
                        </div>
                        <div class="badge-container flex-row" style="${badgeStyle}">
                            <div class="details flex-row"><p>user_badges</p><p class="separator">•</p><p class="separator">•</p><p class="separator">•</p></div>
                            <div class="badges flex-row">${badges}</div>
                        </div>
                    </div>
                    <hr>
                    <div class="message ${emoteOnly}">${message}</div>
                </div>
            </div>
        </div>`);
  
    if (hideAfter !== 999) {
        $(element).appendTo('.main-container').delay(hideAfter * 1000).queue(function () {
            $(this).removeClass(animationIn).addClass(animationOut).delay(1000).queue(function () {
                $(this).remove()
            }).dequeue();
        });
    } else {
        $(element).appendTo('.main-container');
    }
    if (totalMessages > messagesLimit) {
        removeRow(removeSelector);
    }
}

function addAlert(alertTitle, alertContent, alertSubtext, sound, soundVolume){
    totalMessages += 1;
  
    const alert = $.parseHTML(`<div class="chat-message animate__{{animationIn}} animate__animated {{chatTheme}}" id="msg-${totalMessages}">
            <div class="alert-box">
				<svg class="bg-1" width="41.375em" height="21.375em" viewBox="0 0 41.375em 21.375em" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M192.72 342H169.29C163.68 342 158.41 339.82 154.44 335.85L146.16 327.57C142.57 323.98 137.8 322.01 132.72 322.01H69.29C64.21 322.01 59.44 323.99 55.86 327.57L47.58 335.85C43.61 339.82 38.34 342 32.73 342H21.01C9.43001 342 0.0100098 332.58 0.0100098 321V189.28C0.0100098 183.67 2.19001 178.4 6.16001 174.43L94.44 86.15C98.03 82.56 100 77.79 100 72.71V60.99C100 49.41 109.42 39.99 121 39.99H152.72C158.33 39.99 163.6 42.17 167.57 46.14L175.85 54.42C179.44 58.01 184.21 59.98 189.29 59.98H392.72C397.8 59.98 402.57 58 406.15 54.42L414.43 46.14C418.4 42.17 423.67 39.99 429.28 39.99H472.71C477.79 39.99 482.56 38.01 486.14 34.43L514.42 6.15C518.39 2.18 523.66 0 529.27 0H640.99C652.57 0 661.99 9.42 661.99 21V132.72C661.99 138.33 659.81 143.6 655.84 147.57L627.56 175.85C623.97 179.44 622 184.21 622 189.29V221.01C622 232.59 612.58 242.01 601 242.01H569.28C564.2 242.01 559.43 243.99 555.85 247.57L527.57 275.85C523.6 279.82 518.33 282 512.72 282H449.29C443.68 282 438.41 279.82 434.44 275.85L426.16 267.57C422.57 263.98 417.8 262.01 412.72 262.01H289.29C284.21 262.01 279.44 263.99 275.86 267.57L207.58 335.85C203.61 339.82 198.34 342 192.73 342H192.72ZM69.29 320H132.72C138.33 320 143.6 322.18 147.57 326.15L155.85 334.43C159.44 338.02 164.21 339.99 169.29 339.99H192.72C197.8 339.99 202.57 338.01 206.15 334.43L274.43 266.15C278.4 262.18 283.67 260 289.28 260H412.71C418.32 260 423.59 262.18 427.56 266.15L435.84 274.43C439.43 278.02 444.2 279.99 449.28 279.99H512.71C517.79 279.99 522.56 278.01 526.14 274.43L554.42 246.15C558.39 242.18 563.66 240 569.27 240H600.99C611.47 240 619.99 231.48 619.99 221V189.28C619.99 183.67 622.17 178.4 626.14 174.43L654.42 146.15C658.01 142.56 659.98 137.79 659.98 132.71V21C659.98 10.52 651.46 2 640.98 2H529.26C524.18 2 519.41 3.98 515.83 7.56L487.55 35.84C483.58 39.81 478.31 41.99 472.7 41.99H429.27C424.19 41.99 419.42 43.97 415.84 47.55L407.56 55.83C403.59 59.8 398.32 61.98 392.71 61.98H189.28C183.67 61.98 178.4 59.8 174.43 55.83L166.15 47.55C162.56 43.96 157.79 41.99 152.71 41.99H120.99C110.51 41.99 101.99 50.51 101.99 60.99V72.71C101.99 78.32 99.81 83.59 95.84 87.56L7.56001 175.85C3.97001 179.44 2.00001 184.21 2.00001 189.29V321.01C2.00001 331.49 10.52 340.01 21 340.01H32.72C37.8 340.01 42.57 338.03 46.15 334.45L54.43 326.17C58.4 322.2 63.67 320.02 69.28 320.02L69.29 320Z" fill="var(--text-alt)"/></svg>                    
				<svg class="bg-2" width="15.25em" height="5.6875em" viewBox="0 0 15.25em 5.6875em" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.56 90.67L0 89.1L75.28 13.33C83.82 4.73 95.17 0 107.24 0H243.32V2.22H107.24C95.75 2.22 84.96 6.72 76.84 15.38L1.56 90.67Z" fill="var(--text-alt)"/></svg>
				<span class="alert-circles"><svg class="alert-circle-1" width="0.59375em" height="0.59375em"><path fill-rule="evenodd"  stroke="var(--text-alt)" stroke-width="0.0625em" stroke-linecap="butt" stroke-linejoin="miter" fill="none" d="M4.499,0.499 C6.709,0.499 8.499,2.290 8.499,4.499 C8.499,6.709 6.709,8.499 4.499,8.499 C2.290,8.499 0.499,6.709 0.499,4.499 C0.499,2.290 2.290,0.499 4.499,0.499 Z"/></svg><svg class="alert-circle-2" width="0.59375em" height="0.59375em"><path fill-rule="evenodd"  stroke="var(--text-alt)" stroke-width="0.0625em" stroke-linecap="butt" stroke-linejoin="miter" fill="none" d="M4.499,0.499 C6.709,0.499 8.499,2.290 8.499,4.499 C8.499,6.709 6.709,8.499 4.499,8.499 C2.290,8.499 0.499,6.709 0.499,4.499 C0.499,2.290 2.290,0.499 4.499,0.499 Z"/></svg><svg class="alert-circle-3" width="0.59375em" height="0.59375em"><path fill-rule="evenodd"  stroke="var(--text-alt)" stroke-width="0.0625em" stroke-linecap="butt" stroke-linejoin="miter" fill="none" d="M4.499,0.499 C6.709,0.499 8.499,2.290 8.499,4.499 C8.499,6.709 6.709,8.499 4.499,8.499 C2.290,8.499 0.499,6.709 0.499,4.499 C0.499,2.290 2.290,0.499 4.499,0.499 Z"/></svg></span>
                <div class="alert-title-wrapper"><p class="alert-title">${alertTitle}</p><svg class="alert-title-arrow" width="0.5em" height="0.5625em"><path fill-rule="evenodd"  fill="rgb(199, 42, 49)" d="M0.880,4.991 C0.212,4.606 0.212,3.642 0.880,3.258 L6.126,0.237 C6.792,0.145 7.624,0.335 7.624,1.104 L7.624,7.145 C7.624,7.914 6.792,8.395 6.126,8.11 L0.880,4.991 Z"/></svg></div>
                <div class="alert-contents-wrapper"><p class="alert-contents">${alertContent}</p><div class="cursor"><p>.</p></div></div>
                <p class="alert-subtext">${alertSubtext}</p>
            </div>
        </div>`);
    playAlertSound(sound, soundVolume);
    if (hideAfter !== 999) {
        $(alert).appendTo('.main-container').delay(hideAfter * 1000).queue(function () {
            $(this).removeClass(animationIn).addClass(animationOut).delay(1000).queue(function () {
                $(this).remove()
            }).dequeue();
        });
    } else {
        $(alert).appendTo('.main-container');
    }
    if (totalMessages > messagesLimit) {
        removeRow(removeSelector);
    }
}

function checkRole(data){
  	let badge = data.tags.badges;
  	let badgeArr = badge.split(',');
  	let role, specialBadge;
   	if(data.badges.length > 0){
    	specialBadge = data.badges[0].url;
    } else {
    	specialBadge = null;
    }
  
  	if(badge.includes('broadcaster')){
       	role = 'broadcaster';
      	specialBadge = '';
    } else if(badge.includes('moderator')){
    	role = 'moderator';
		specialBadge = '';
    } else if(badge.includes('vip')){
    	role = 'vip';
		specialBadge = '';
    } else if(badge.includes('subscriber')){
    	role = 'subscriber';
      	specialBadge = '';
    } else {
    	role = 'regular';
      	specialBadge = '';
    }
  	
  	return [role, specialBadge];
}

function playAlertSound(sound, soundVolume) {
    sound.volume = soundVolume;
    sound.play();
    if (sound.currentTime == sound.duration) {
        sound.pause();
        sound.currentTime = 0;
    }
}

function attachEmotes(message) {
    let text = html_encode(message.text);
    let data = message.emotes;
  	if (data[0]) {
        hasEmotes = "has-emotes"
    } else {
        hasEmotes = ""
    }
  	let isEmoteOnly = message.tags['emote-only']
    if (typeof message.attachment !== "undefined") {
        if (typeof message.attachment.media !== "undefined") {
            if (typeof message.attachment.media.image !== "undefined") {
                text = `${message.text}<img src="${message.attachment.media.image.src}">`;
            }
        }
    }
    return text.replace(/([^\s]*)/gi, function (m, key) {
        let result = data.filter(emote => {
            return html_encode(emote.name) === key
        });
        if (typeof result[0] !== "undefined") {
            let url;
            if (isEmoteOnly) {
              url = result[0]['urls'][4];
              //console.log('emote only')
            } else {
              url = result[0]['urls'][1];
              //console.log('not emote only')
            }
            if (provider === "twitch") {
                return `<img class="emote" src="${url}"/>`;
            } else {
                if (typeof result[0].coords === "undefined") {
                    result[0].coords = { x: 0, y: 0 };
                }
                let x = parseInt(result[0].coords.x);
                let y = parseInt(result[0].coords.y);

                let height = "{{emoteSize}}px";
                let width = "{{emoteSize}}px";
                if (provider === "mixer") {
                    if (result[0].coords.width) {
                        width = `${result[0].coords.width}px`;
                    }
                    if (result[0].coords.height) {
                        height = `${result[0].coords.height}px`;
                    }
                }
                return `<div class="emote" style="width: ${width}; height:${height}; display: inline-block; background-image: url(${url});"></div>`;
            }
        } else return key;
    }
    );
}

function html_encode(e) {
    return e.replace(/[<>"^]/g, function (e) {
        return "&#" + e.charCodeAt(0) + ";";
    });
}

function isEmote(data) {
    let msg = data.text;
    msg = msg.replace(/\s\s+/g, ' ');
    let msg_split = msg.split(" ");
	//console.log(msg);

    let emotes = data.emotes;
    let emote_names = [];

    let emoteOnly = true;

    for (let j = 0; j < emotes.length; j++) {
        emote_names.push(emotes[j].name)
    }

    //console.log(emote_names)

    for (let i = 0; i < msg_split.length; i++) {
        //console.log(msg_split[i])

        if (!emote_names.includes(msg_split[i])) {
            emoteOnly = false
        }
    }
    return emoteOnly;
}

function removeRow(selector) {
    if (!$(selector).length) {
        return;
    }
    if (animationOut !== "none" || !$(selector).hasClass(animationOut)) {
        if (hideAfter !== 999) {
            $(selector).dequeue();
        } else {
            $(selector).addClass(animationOut).delay(1000).queue(function () {
                $(this).remove().dequeue()
            });

        }
        return;
    }

    $(selector).animate({
        height: 0,
        opacity: 0
    }, 'slow', function () {
        $(selector).remove();
    });
}