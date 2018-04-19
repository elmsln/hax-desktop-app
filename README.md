# hax-desktop-app
HAX but running on your desktop. In the future this will be built to multiple platforms but for now it exists as source. Here are some goals of the HAX desktop app:
- Create the fastest, most accessible, highest quality way to write documentation for software projects
- Load / Save directly to HTML files on the local file system w/ a lightweight outline structure (dictated by outline.json)
- Simple workflow to publish directly to git / github pages
- Integration with HAX AppStores (way out there but we'll get one)
- Ingestion into other backends like content storage engines (DB based or static hosting)

To build HAX desktop from source, run the following

```
git clone git@github.com:LRNWebComponents/hax-desktop-app.git
cd hax-desktop-app
sh build.sh
```


If you don't have a development environment, here's what you have to do to set it up ahead of time.
- download and install https://nodejs.org/en/
```
npm install -g bower
npm install -g git
```
