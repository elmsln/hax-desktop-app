# hax-desktop-app

Read directions on how to use HAX the deskop app and get the link to download packaged builds. [You can read about how to use this in this training](https://open-curriculum.gitbooks.io/oer-camp-2018/content/get-started-with-hax.html). If you are a developer or you want to help us take it further, keep reading

HAX but running on your desktop. Here are some goals of the HAX desktop app:
- Create the fastest, most accessible, highest quality way to write documentation for software projects
- Load / Save directly to HTML files on the local file system w/ a lightweight outline structure (dictated by outline.json)
- Simple workflow to publish directly to git / github pages
- Integration with HAX AppStores (way out there but we'll get one)
- Ingestion into other backends like content storage engines (DB based or static hosting)

To build HAX desktop from source, run the following

```
git clone https://github.com/LRNWebComponents/hax-desktop-app.git
cd hax-desktop-app
sh build.sh
```


If you don't have a development environment, here's what you have to do to set it up ahead of time.
- download and install https://nodejs.org/en/
```
npm install -g bower
npm install -g git
```
