function run() {    
    document.getElementById('input').oninput = handleInputLinkChange();
}

function handleInputLinkChange() {
    return (e) => {
        const inputUrl = e.target.value.trim();

        if(inputUrl === '') {
            setHideOutput(true);
            setInputInvalid(false);
            return;
        }

        const data = getObjectDataFromURL(inputUrl);

        if (data === false) {
            alert("Ongeldige link");
            setInputInvalid(true);
            return;
        } else {
            setHideOutput(false);
            setInputInvalid(false);
        }

        const urlProxy = toProxyLink(data);
        const urlOnline = toOnlineDigidocLink(data);
        const urlOffline = toOfflineDigidocLink(data);

        setAnchorValue('output-proxy', urlProxy.toString());
        setAnchorValue('output-online', urlOnline.toString());
        setAnchorValue('output-offline', urlOffline.toString());

        if(data !== false) {
            copyToClipboard(urlProxy.toString());
        }
    }
}

function setHideOutput(hide) {
    document.getElementById('output').classList.toggle('hidden', hide);
}

function setInputInvalid(isInvalid) {
    document.getElementById('input').classList.toggle('invalid', isInvalid);
}

function copyToClipboard(textToCopy) {
    try {
        navigator.clipboard.writeText(textToCopy);
    } catch (e) {
        alert("Kon de link niet kopieren naar uw klembord.")
    }
}
