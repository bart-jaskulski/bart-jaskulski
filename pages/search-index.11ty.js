export default class SearchIndex {
    data() {
        return { permalink: "/search-index.json", eleventyExcludeFromCollections: true };
    }

    render({ collections }) {
        return JSON.stringify(collections.writing.map(item => ({
            title: item.data.title,
            url: item.url,
            date: item.date.toISOString().slice(0, 10),
            text: item.templateContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
        })));
    }
}
