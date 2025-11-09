# Parsing JSON and models directory list

⭐️⭐️⭐️ **Do not edit or change the any *.json or *.ckpt files**⭐️⭐️⭐️ 

This note explains how to understand and use the JSON files as well as the models directory lists. 

We have *.ckpt & *.json files in two directories;
 1. Macintosh HD: `DT_BASE_DIR]/Models` 
 2. Stash: `STASH_DIR/Models`



### Model Files
The model files are all in one single directory. Unfortunately, DrawThings does not put them in separate directories. Have to live with this. 

There are at least 7 types of model files;


|#| Model Type Desc | model_type | Derived From | Notes|
|--|--|--|--|--|
|1|Main model files| model |custom.json||
|2|LoRA model files| lora |custom_lora.json||
|3|ControlNet model files| control |custom_controlnet.json||
|4|clip encoder model files| clip |custom.json|| A clip encodfer may be used by more than 1 main model
|5|text encoder model files| text |custom.json|| A text encodfer may be used by more than 1 main model
|6|Face restore model files| face_restorer |/settings.json| Not in the 3 key json files, but filename matched from /settings.json|
|7|Image Upscale model files| upscaler |/settings.json|Not in the 3 key json files, but filename matched from /settings.json|
|8|Unknown model files| unknown |||

### Determining model file types 
1. Model file name is specified in one of the three main JSON files. The JSON key indicates the model_type. 
1. We can determine the model_type by Matching the model file. Name to the file match patterns in `/settings.json` 
1. Models that cannot be determined by either of the 2 steps above are assigned `model_type=unknown`. 





