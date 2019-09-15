const Joi=require('joi');

const Validator=(schema)=>{
    const model=Joi.object().keys({
        title:Joi.string().required(),
        user:Joi.string().required(),
        imageURL:Joi.string()
    });
    return model.validate(schema);
}

module.exports=Validator;
