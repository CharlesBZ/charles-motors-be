const express = require("express")
const request = require("request")
const config = require("config")
const router = express.Router()
const auth = require("../../middleware/auth")
const { check, validationResult } = require("express-validator")
const Profile = require("../../models/Profile")
const User = require("../../models/User")

// @router    GET api/profile/me
// @desc      Get current users profile
// @access    Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    )

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" })
    }

    res.json(profile)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills are required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body

    // Build profile object
    const profileFields = {}
    profileFields.user = req.user.id
    if (company) profileFields.company = company
    if (website) profileFields.website = website
    if (location) profileFields.location = location
    if (bio) profileFields.bio = bio
    if (status) profileFields.status = status
    if (githubusername) profileFields.githubusername = githubusername
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim())
    }

    // Build social object
    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube
    if (facebook) profileFields.social.facebook = facebook
    if (twitter) profileFields.social.twitter = twitter
    if (instagram) profileFields.social.instagram = instagram
    if (linkedin) profileFields.social.linkedin = linkedin

    try {
      let profile = await Profile.findOne({ user: req.user.id })
      if (profile) {
        // Update existing profile
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        )

        return res.json(profile)
      }

      // Create new profile
      profile = new Profile(profileFields)
      await profile.save() // Save the profile
      res.json(profile) // Send the created profile as the response
    } catch (err) {
      console.error(err.message)
      res.status(500).send("Server Error")
    }
  }
)

// @route     GET api/profile
// @desc      Get all profiles
// @access   Public

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"])
    res.json(profiles)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

// @route     GET api/profile/user/:user_id
// @desc      Get profile by user ID
// @access   Public

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"])

    if (!profile) return res.status(400).json({ msg: "Profile not found" })

    res.json(profile)
  } catch (err) {
    console.error(err.message)
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" })
    }
    res.status(500).send("Server Error")
  }
})

// @route     DELETE api/profile
// @desc      Delete profile, user & posts
// @access    Private

router.delete("/", auth, async (req, res) => {
  try {
    //@TODO: remove users posts

    // Remove profile
    await Profile.findOneAndDelete({ user: req.user.id })

    //Remover user
    await User.findOneAndDelete({ _id: req.user.id })

    res.json({ msg: "User Deleted " })
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

// @route     PUT api/profile/experience
// @desc      Add profile experience
// @access    private

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    // Work experience fields
    const { title, company, location, from, to, current, description } =
      req.body

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    }

    try {
      const profile = await Profile.findOne({ user: req.user.id })

      profile.experience.unshift(newExp)

      profile.save()

      res.json(profile)
    } catch (err) {
      console.error(err.message)
      res.status(500).send("Server Error")
    }
  }
)

// @route     DELETE api/profile/experience/:exp_id
// @desc      Delete experience from profile
// @access    Private

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })

    // Get remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id)

    if (removeIndex < 0) {
      return res.status(404).json({ msg: "Experience not found" })
    }

    // Splice out of array
    profile.experience.splice(removeIndex, 1)

    await profile.save()

    res.json(profile)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

// @route     PUT api/profile/education
// @desc      Add profile education
// @access    Private

router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field of study is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { school, degree, fieldofstudy, from, to, current, description } =
      req.body

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    }

    try {
      const profile = await Profile.findOne({ user: req.user.id })
      profile.education.unshift(newEdu)
      await profile.save()
      res.json(profile)
    } catch (err) {
      console.error(err.message)
      res.status(500).send("Server Error")
    }
    console.log("Hi i am running", school)
  }
)

// @route     DELETE api/profile/education/:edu_id
// @desc      Delete education from profile
// @access    Private

router.delete("/education/:education_id", auth, async (req, res) => {
  try {
    console.log("DELETE /education/:education_id route hit")
    const profile = await Profile.findOne({ user: req.user.id })

    if (!profile) {
      return res.status(404).json({ msg: "Profile not found" })
    }

    console.log(`Profile found: ${profile._id}`)
    console.log(`Education ID to remove: ${req.params.education_id}`)

    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.education_id)

    if (removeIndex < 0) {
      return res.status(404).json({ msg: "Education not found" })
    }

    profile.education.splice(removeIndex, 1)
    await profile.save()

    console.log("Education entry deleted")
    res.json(profile)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

// @route  GET api/profile/github/:username
// @desc  Get the user repos from Github
// @access Public

router.get("/github/:username", (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubClientId"
      )}&client_secret=${config.get("githubClientSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    }

    request(options, (error, response, body) => {
      if (error) console.error(error)
      if (response.statusCode !== 200) {
        res.status(404).json({ msg: "We can't find a github profile" })
      }
      res.json(JSON.parse(body))
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

module.exports = router
