const axios = require('axios');
const { Recipe, Diet } = require('../db.js');
const {
    API_KEY
  } = process.env;
// GET API INFO ------------------------------------------------------
const getApiInfo = async () => {
    try {
        let info = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&addRecipeInformation=true&number=100`)

        let recipes = info.data.results.map(e => {
            return {
                id: e.id,
                title: e.title,
                image: e.image,
                summary: e.summary,
                healthScore: e.healthScore,
                diets: e.diets,
                steps: (e.analyzedInstructions[0] && e.analyzedInstructions[0].steps ? e.analyzedInstructions[0].steps.map(e => e.step).join("| ") : 'No hay pasos')
            }
        });
        return recipes;

    } catch (error) {
        console.log(
             error);
    }
};

// GET DB INFO -------------------------------------------------------
const getDBInfo = async () => {
    try {
        const dbInfo = await Recipe.findAll({
            include: {
                model: Diet,
                attributes: ['name'],
                through: {
                    attributes: [],
                },
            }
        });
        var dato = JSON.parse(JSON.stringify(dbInfo, null, 2));
        dato.forEach((e) => (e.diets = e.diets.map((d) => d.name)));
        return dato;

    } catch (error) {
        console.log(error);
    }
};

// GET TOTAL INFO (API + DB) -----------------------------------------
const getTotalInfo = async () => {
    try {
        const apiInfo = await getApiInfo();
        const dbInfo = await getDBInfo();
        return [...apiInfo, ...dbInfo];

    } catch (error) {
        console.log( error);
    }
};

// GET ALL DIETS 
const getAllDiets = async () => {
    try {
        // si ya está cargada mi db no hago nada
        const preDiets = await Diet.findAll();
        if (preDiets.length) {
            return preDiets;
        }

        const typesDiets = [
            "gluten free",
            "dairy free",
            "ketogenic",
            "lacto ovo vegetarian",
            "vegan",
            "pescatarian",
            "paleolithic",
            "primal",
            "fodmap friendly",
            "whole 30",
        ];

        typesDiets.forEach(diet => {
            Diet.findOrCreate({
                where: { name: diet }
            });
        });

        let diets = await Diet.findAll();
        return diets;

    } catch (error) {
        console.log(error);
    }
};

//----------------------------------------------------------------------
module.exports = { getApiInfo, getDBInfo, getTotalInfo, getAllDiets }
