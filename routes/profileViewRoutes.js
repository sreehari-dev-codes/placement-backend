const express = require("express");
const { query, hasConnectionString } = require("../db");
const store = require("../data/fallbackStore");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    if (!hasConnectionString) {
      return res.json({
        ok: true,
        source: "fallback",
        total_views: store.profileViews.length,
        data: store.profileViews,
      });
    }

    const result = await query(
      `
      SELECT view_id, student_id, viewed_by, viewed_at
      FROM profile_views
      ORDER BY viewed_at DESC, view_id DESC
      `
    );
    return res.json({
      ok: true,
      source: "database",
      total_views: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/summary", async (_req, res, next) => {
  try {
    if (!hasConnectionString) {
      return res.json({
        ok: true,
        source: "fallback",
        total_views: store.profileViews.length,
      });
    }

    const result = await query("SELECT COUNT(*)::INT AS total_views FROM profile_views");
    return res.json({
      ok: true,
      source: "database",
      total_views: result.rows[0]?.total_views || 0,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  const studentId = req.body?.student_id;
  const viewedBy = req.body?.viewed_by;

  if (studentId !== undefined && studentId !== null && Number.isNaN(Number(studentId))) {
    return res.status(400).json({ ok: false, message: "student_id must be a number" });
  }

  try {
    if (!hasConnectionString) {
      const created = {
        view_id: store.counters.profileViews++,
        student_id: studentId ? Number(studentId) : null,
        viewed_by: viewedBy || null,
        viewed_at: new Date().toISOString(),
      };
      store.profileViews.push(created);
      return res.status(201).json({ ok: true, source: "fallback", data: created });
    }

    const result = await query(
      `
      INSERT INTO profile_views (student_id, viewed_by)
      VALUES ($1, $2)
      RETURNING view_id, student_id, viewed_by, viewed_at
      `,
      [studentId ? Number(studentId) : null, viewedBy || null]
    );
    return res.status(201).json({ ok: true, source: "database", data: result.rows[0] });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({ ok: false, message: "Invalid student_id" });
    }
    return next(error);
  }
});

module.exports = router;
