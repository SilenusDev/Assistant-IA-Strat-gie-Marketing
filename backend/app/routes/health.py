from flask import jsonify


def init_health_routes(bp):
    @bp.route("/health", methods=["GET"])
    def healthcheck():
        return jsonify({"status": "ok"}), 200
