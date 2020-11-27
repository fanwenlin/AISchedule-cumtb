function scheduleHtmlParser(html) {
        let container = html.substr(5,html.length-11);
        return JSON.parse(container);
}
