export default {
    layout: "layouts/post.njk",
    date: "git Created",
    permalink: "/writings/{{ page.fileSlug }}/",
    ogType: "article",
    eleventyComputed: {
        date: (data) => data.page.date
    }
};
