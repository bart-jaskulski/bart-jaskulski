export default {
    layout: "layouts/post.njk",
    date: "git Created",
    permalink: "/writings/{{ page.fileSlug }}/",
    eleventyComputed: {
        date: (data) => data.page.date
    }
};
