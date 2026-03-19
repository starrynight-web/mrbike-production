from locust import HttpUser, task, between

class MrBikeUser(HttpUser):
    wait_time = between(1, 4)

    @task(3)
    def view_bikes(self):
        """Browse the bike catalogue"""
        self.client.get("/api/bikes/")

    @task(2)
    def view_bike_detail(self):
        """View a specific bike (e.g., Suzuki Gixxer)"""
        self.client.get("/api/bikes/suzuki-gixxer-sf-fi-abs/")

    @task(2)
    def view_brands(self):
        """View all brands"""
        self.client.get("/api/brands/")

    @task(1)
    def view_marketplace(self):
        """View used bike listings"""
        self.client.get("/api/marketplace/")

    @task(1)
    def homepage_stats(self):
        """Get homepage stats"""
        self.client.get("/api/bikes/featured/")
