# DockDev
---
### DockDev Overview

DockDev is a Docker project management tool for Mac Users. DockDev simplifies the process of creating, managing and deploying Docker projects through an intuitive GUI.  

![Add Container Screenshot](/screenshots/DockDev-add-Container.jpg)
*Beta Screenshot: Add Container Page*

### How to use DockDev

DockDev is a desktop application. To download, go to www.dockdev.com. To use DockDev, you will also need the [Docker Toolbox for Mac](https://www.docker.com/products/docker-toolbox) installed.

Once you have DockDev and Docker Installed, simply load the application and get ready to start working with Docker. The initial loading of the app may take a few minutes, as we will be creating a new docker-machine named "dockdev" for you.

Thereafter, you should be able to easily create and manage projects. If you click the plus button next to "Projects" in the left Navigation, you will be able to enter in your project name and folder path.

After that, you will click the add button next to the server text on the main screen. This will take you to the Add Container page (see above). Simply select which servers and databases you would like to use for your project and click save.

Don't worry about selecting the wrong databases, you can easily delete them and add new or different ones. At the moment, we only support Node, so that is the server you will be using.

Once you have your containers selected, you will be on the project page (see below). From here, you will be able to start, stop, and restart your project.

You can also deploy your project to DigitalOcean and push any updates through the navigation on top of the server box. To deploy a project, simply click deploy and then click update when you are ready to push changes. Before doing this, however, you must first input your DigitalOcean access token into the settings page in the top right of the application.

![Project Details Screenshot](/screenshots/DockDev-Project-Details.jpg)

### Thank You

Thank you for taking the time to learn more about DockDev. To learn more about DockDev and our team, please visit us at www.dockdev.com/about
