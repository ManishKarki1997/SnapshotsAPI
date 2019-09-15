const Joi=require('joi');

const Validator=(schema)=>{
    const model=Joi.object().keys({
        name:Joi.string().required(),
        username:Joi.string().alphanum().min(3).max(15).required(),
        password:Joi.string().regex(/^[a-zA-Z0-9]{3,25}/),
        email:Joi.string().email({minDomainSegments:2}),
        profileImageURL:Joi.string()
    });
    return model.validate(schema);
}

module.exports=Validator;
