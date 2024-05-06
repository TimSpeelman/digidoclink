const HOSTS = {
    '1': { onlineRoot: 'https://bzk.digidoc-online.rijksweb.nl', offlineRoot: 'digidoc2:' }
};
const DEFAULT_HOST = '1';
const DEFAULT_VARIANT = getLocallyStoredFavoriteVariant() || 'online';

const BASE_URL_PROXY = new URL('/link', window.location.href);
const SUPPORTED_ONLINE_TYPES = ['2', '7'];

const PATH_ONLINE_TAAK_LINK = '/app/inboxen';
const PATH_ONLINE = '/tabs/module/favorieten';

const OBJECT_TYPE_TO_NUMBER = {
    'subdossier': '2',
    'werkmap': '7',
}

/**
 * ObjectData :: {
 *   id: string,
 *   type: string, // 1, 2, ..
 *   host?: string,
 *   variant?: 'online' | 'offline'
 * }
 */
function getObjectDataFromURL(urlString) {
    try {
        const dataFromProxy = tryParseProxyLink(urlString);
        if(dataFromProxy) return dataFromProxy;

        for (const host in HOSTS) {
            const data = tryParseWithHost({ urlString, host: HOSTS[host] });

            if(data) {
                return { ...data, host };
            }
        }

        return false;
    } catch (e) {
        console.warn("Failed to parse URL", urlString, "got error", e)
        return false;
    }
}

function tryParseProxyLink(urlString) {
    const input = new URL(urlString);
    if(input.pathname === BASE_URL_PROXY.pathname) {
        const id = input.searchParams.get('id');
        const type = input.searchParams.get('type');
        const host = input.searchParams.get('host') || DEFAULT_HOST;
        const variant = input.searchParams.get('variant');
        return { id, type, host, variant };
    }
}

function tryParseWithHost({ urlString, host: { onlineRoot, offlineRoot } }) {
    if(urlString.startsWith(offlineRoot)) {
        return parseDigidocOfflineBase64Data(urlString.replace(offlineRoot, ''));
    } else if(urlString.startsWith(onlineRoot)) {
        return parseDigidocOnlineLink(urlString);
    } else {
        return false;
    }
}

function objectTypeToNumber(type) {
    return OBJECT_TYPE_TO_NUMBER[type];
}

/** Replace string objectTypes (such as 'werkmap') by their numeric ID */
function normalizeObjectType(objectType) {
    return (objectType in OBJECT_TYPE_TO_NUMBER) ? OBJECT_TYPE_TO_NUMBER[objectType] : objectType;
}

/** Replace numeric ID of objectTypes with their string representation if known (such as 'werkmap') */
function getTextVariantOfObjectType(objectTypeNumber) {
    return Object.keys(OBJECT_TYPE_TO_NUMBER).find(key => OBJECT_TYPE_TO_NUMBER[key] === `${objectTypeNumber}`) || objectTypeNumber;
}

function parseDigidocOfflineBase64Data(base64EncodedData) {
    const plaintextData = atob(base64EncodedData); // `id={[id]}&type=[type]`
    const plaintextDataNormalized = plaintextData.replace(/[{}]/g, ''); // `id=[id]&type=[type]`

    const asUrl = new URL("?" + plaintextDataNormalized, 'http://example.com');
    const id = asUrl.searchParams.get('id');
    const type = normalizeObjectType(asUrl.searchParams.get('type'));

    return { id, type };
}

function parseDigidocOnlineLink(urlString) {
    const processed = urlString.replace(/[{}]/g, ''); // digidoc link trash
    const input = new URL(processed);
    
    if (isTaakLink(input)) {
        const id = input.searchParams.get('id');
        const type = normalizeObjectType('werkmap');

        if (!id) throw new Error("Missing params"); 
        
        return { id, type };
    } else {
        const id = input.searchParams.get('objectId');
        const type = normalizeObjectType(input.searchParams.get('objectType'));
        if(!id || !type) throw new Error("Missing params");

        return { id, type };
    }
}

function toDigidocLink(data) {
    if(data.variant === 'online') {
        return toOnlineDigidocLink(data);
    } else {
        return toOfflineDigidocLink(data);
    } 
}

function toOnlineDigidocLink(data) {
    const host = HOSTS[data.host].onlineRoot;
    
    if(SUPPORTED_ONLINE_TYPES.indexOf(data.type) === -1) {
        return toSingleModeLink(data);
    }

    const url = new URL(PATH_ONLINE, host);
    url.searchParams.set('objectId', data.id);
    url.searchParams.set('objectType', getTextVariantOfObjectType(data.type));
    url.searchParams.set('lastShownDetailPage', 'mapuipage');
    return url;
}

function toSingleModeLink(data) {
    const host = HOSTS[data.host].onlineRoot;
    const url = new URL(host);
    url.searchParams.set('navigationType', 'hyperlink');
    url.searchParams.set('objectId', data.id);
    url.searchParams.set('objectType', getTextVariantOfObjectType(data.type));
    return url;
}

function toOfflineDigidocLink(data) {
    const plaintext = `id={${data.id}}&type=${data.type}`;
    const encoded = btoa(plaintext);
    const prefix = HOSTS[data.host].offlineRoot;
    const url = new URL(`${prefix}${encoded}`);
    return url;
}

function toProxyLink(data) {
    const url = new URL(BASE_URL_PROXY);
    url.searchParams.set('id', data.id);
    url.searchParams.set('type', data.type);
    if(data.host !== undefined) url.searchParams.set('host', data.host);
    if(data.variant) url.searchParams.set('variant', data.variant);
    return url;
}

function isTaakLink(url) {
    return url.pathname.startsWith(PATH_ONLINE_TAAK_LINK);
}

function setAnchorValue(anchorElId, href, displayText = href) {
    try {
        document.getElementById(anchorElId).innerHTML = displayText;
        document.getElementById(anchorElId).href = href;
    } catch (e) {
        console.warn('Could not set link', e)
    }
}

function getLocallyStoredFavoriteVariant() {
    const favorite = localStorage.getItem('favoriteVariant');
    if(['online', 'offline'].includes(favorite)) {
        return favorite;
    }
}

function storeFavoriteVariantLocally(variant) {
    console.log('Storing favorite variant', variant)
    localStorage.setItem('favoriteVariant', variant);
}

function dropHostWhenDefault(data) {
    return {
        ...data,
        host: data.host === DEFAULT_HOST ? undefined : data.host
    }
}
