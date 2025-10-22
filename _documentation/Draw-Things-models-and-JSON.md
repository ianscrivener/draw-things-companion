# DrawThings models and JSON 

The overall purpose of the app is to offload, "stash", large AI model files so as to free up system disks. and decotter the drawthings app.

The stash directory will contain all possible model files And the stashed JSON will contain all settings for those model files. 

The working directory (on the Mac) will contain a subset of model files and the JSON files, specifically the root array, will contain a subset of the JSON objects pertaining to the model files on the working directory. 

All models are contained in a single models directory 

The DrawThings app uses five (5) JSON files to configure the custom app settings. JSON file consists of a root array with multiple child objects - eg one object per AI image generation model. The JOSN files are;


#### 1) Main models - `custom.json`
Depending on the model will include four models for FLux, Qwen etc, two for SDXL; 
 - `file` - eg `jibmixflux_v10analogagain_f16.ckpt`
 - `autoencoder` AKA VAE - eg `flux_1_vae_f16.ckpt`- may be used by many models 
 - `clip_encoder` - eg `clip_vit_l14_f16.ckpt` - may be used by many models 
 - `text_encoder` - eg `t5_xxl_encoder_q6p.ckpt` - may be mute used by many models 

#### 2) LoRAs - custom_lora.json 
 - Contains one model file that will only be used by this LoRA.

#### 3) ControlNets - custom_control.json
- Contains one model file that will only be used by this ControlNet.
 
#### 4) Configs - custom_configs.json (ignored currently)
 
#### 5) Prompt Styles - custom_prompt_styles.json (ignored currently)
