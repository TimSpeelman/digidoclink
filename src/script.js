function isTaakLink(url) {
    return url.pathname.startsWith('/app/inboxen');
}

function checkPerm() {
    navigator.permissions.query({ name: "write-on-clipboard" }).then((result) => {
        if (result.state == "granted" || result.state == "prompt") {
            alert("Write access granted!");
        } else {
            alert("Write access rejected")
        }
    });
}

checkPerm();

function transform(urlString) {
    try {
        const processed = urlString.replace(/[{}]/g, ''); // digidoc link trash
        const input = new URL(processed);

        console.log("Input", input);

        if(isTaakLink(input)) {
            const id =  input.searchParams.get('id');                
            if(!id) throw new Error("Missing params");

            const output = new URL("/tabs/module/favorieten", input);
            output.searchParams.set('objectId', id);
            output.searchParams.set('objectType', 'werkmap');
            output.searchParams.set('lastShownDetailPage', 'mapuipage');
            return output;
        } else {
            const objectId = input.searchParams.get('objectId');
            const objectType = input.searchParams.get('objectType');
            if(!objectId || !objectType) throw new Error("Missing params");
            
            const output = new URL("/tabs/module/favorieten", input);
            output.searchParams.set('objectId', objectId || id);
            output.searchParams.set('objectType', objectType);
            output.searchParams.set('lastShownDetailPage', 'mapuipage');
            return output;
        }
    } catch (e) {
        return false;
    }
}

function handleInput(e) {
    const input = e.target.value;
    const result = transform(input);
    const href = result === false ? "" : result;
    const displayValue = result === false ? "Ongeldige link" : result;

    document.getElementById('output').innerHTML = displayValue;
    document.getElementById('output').href = href;

    if(result !== false) {
        try { 
            navigator.clipboard.writeText(result);
        } catch (e) {
            alert("Kon link niet kopieren naar klembord: " + result)
        }
    }

    document.getElementById('input').value = ""
}

document.getElementById('input').oninput = handleInput;