const FORWARD_DELAY_IN_MS = 3000;

function run() {
    setFavoriteOnAlternativeLinkClick();
    setDelayTime(FORWARD_DELAY_IN_MS);

    try {
        const objectData = getObjectDataFromLocation();

        const urlOnline = toDigidocLink({ ...objectData, variant: 'online' });
        const urlOffline = toDigidocLink({ ...objectData, variant: 'offline' });

        const redirectionVariant = objectData.variant;
        const redirectUrl = redirectionVariant === 'online' ? urlOnline : urlOffline;

        setAnchorValue('output-offline', urlOffline.toString(), 'Digidoc Desktop*');
        setAnchorValue('output-online', urlOnline.toString(), 'Digidoc Online');

        setTimeout(() => {
            markAsForwarding(redirectionVariant, true);

            const timeout = setTimeout(() => {
                window.location.assign(redirectUrl.toString());
            }, FORWARD_DELAY_IN_MS);

            cancelForwardOnAlternativeLinkClick({ timeout });
        }, 100);

    } catch (e) {
        setMessage('Er is iets misgegaan. Doorsturen naar Digidoc mislukt.');
        setHideForwardLinks(true);
    }
}

function getObjectDataFromLocation() {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');
    const type = url.searchParams.get('type');
    const host = url.searchParams.get('host') || DEFAULT_HOST;
    const variant = url.searchParams.get('variant') || DEFAULT_VARIANT;
    return { id, type, host, variant };
}

function startCountdown({ startTime, delayInMS }) {
    const interval = setInterval(() => {
        const millisPassed = Date.now() - startTime;
        const remainingSeconds = (delayInMS - millisPassed) / 1000;
        setRemainingSeconds(Math.max(1, Math.ceil(remainingSeconds)));
    }, 100);

    return interval;
}

function setRedirectTarget(text) {
    document.getElementById('redirect-target').innerText = text;
}

function setRemainingSeconds(seconds) {
    document.getElementById('seconds').innerText = `${seconds} seconde${seconds > 1 ? 'n' : ''}`;
}

function cancelForwardOnAlternativeLinkClick({ timeout }) {
    const listener = function () {
        clearTimeout(timeout);
        markAsForwarding('online', false);
        markAsForwarding('offline', false);
    };

    document.getElementById('output-online').addEventListener('click', listener);
    document.getElementById('output-offline').addEventListener('click', listener);
}

function setFavoriteOnAlternativeLinkClick() {
    document.getElementById('output-online').addEventListener('click', function () {
        storeFavoriteVariantLocally('online');
    })
    document.getElementById('output-offline').addEventListener('click', function () {
        storeFavoriteVariantLocally('offline');
    })
}

function setDelayTime(millis) {
    const style = `transition-duration: ${millis}ms;`;
    document.getElementById('output-online').style = style;
    document.getElementById('output-offline').style = style;
}

function setHideForwardLinks(hide) {
    document.getElementById('buttons').classList.toggle('hidden', hide);
}

function markAsForwarding(variant, on) {
    document.getElementById(`output-${variant}`).classList.toggle('forwarding', on);
}
