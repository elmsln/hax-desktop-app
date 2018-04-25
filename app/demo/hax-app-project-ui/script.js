window.addEventListener('WebComponentsReady', async (e) => {
  const outlineUi = document.querySelector('#projectUi');

  const project = {
    "title": "odl-docker",
    "location": "/Users/scienceonlineed/Documents/odl-docker",
    "lastEdited": "2018-04-23T19:21:34.100Z",
    "outlineLocation": null,
    "image": null,
  };

  const updateProject = (project) => {
    outlineUi.setAttribute('project', JSON.stringify(project));
  }
  updateProject(project);

  window.addEventListener('find-outline-init', (e) => {
    let project = e.detail;
    project.outlineLocation = '/src/outline.json';
    updateProject(project);
    console.log(`Find outline triggered for this project:`, e);
  });

  window.addEventListener('generate-outline-init', (e) => {
    let project = e.detail;
    project.outlineLocation = '/outline.json';
    updateProject(project);
    console.log(`Generate event triggered for this project:`, e);
  });

  window.addEventListener('back', (e) => {
    console.log(`Back clicked`);
  });

});