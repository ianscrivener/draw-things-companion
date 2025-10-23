# Two-pane react module spec

### Functional and UI requirements 


![alt text](image-1.png)


#### Page title and save button 
1. Top left corner is the page title, ie. one of "Main Models", "LoRA MOdels", "ControlNet Models"
1. Top Right corner is a save button which will execute the file transfers and rearrangements.
1. To the left of the save button is a cancel button which is faint and grey, not so prominent.  
1. If the user attempts to leave the view before saving or cancelling, a modal will be displayed to disallow this. 


#### Two pane file manager UI device 

1. There will be two panes on the page, "Macintosh HD" and "Stash". 
1. **ALL** models will be displayed in the stash right hand pane. 
1. Subset of models will be in the left hand "Macintosh HD" pane. 
1. Models that appear in the left hand pane will be grayed out in the right hand pane. 
1. Models in the right-hand pane will be in alphabetical order 
1. Models in the left-hand pane will be in user-defined order.
1. The user can **Drag&Drop** the models in the left hand pane to change their order.  
1. The user can **Drag&Drop** the models between the left and right hand panes. 
1. **Double clicking** on a model will display a model with metadata information about that model. 

### Formkit drag and drop React component

https://drag-and-drop.formkit.com/

Use FormKit's drag and drop react component to achieve this functionality. 

`npm install @formkit/drag-and-drop`

