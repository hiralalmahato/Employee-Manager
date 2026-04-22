package com.ems.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import com.mongodb.ConnectionString;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.MongoClientSettings;

@Configuration
public class MongoConfig {

	@Bean
	public MongoClient mongoClient(Environment environment) {
		String mongoUri = firstNonBlank(
			environment.getProperty("MONGO_URI"),
			environment.getProperty("MONGODB_URI"),
			environment.getProperty("SPRING_DATA_MONGODB_URI")
		);

		if (mongoUri == null) {
			throw new IllegalStateException("Missing MongoDB connection string. Set MONGO_URI, MONGODB_URI, or SPRING_DATA_MONGODB_URI in Render.");
		}

		ConnectionString connectionString = new ConnectionString(mongoUri);
		MongoClientSettings settings = MongoClientSettings.builder()
				.applyConnectionString(connectionString)
				.build();

		return MongoClients.create(settings);
	}

	private String firstNonBlank(String... values) {
		for (String value : values) {
			if (value != null && !value.isBlank()) {
				return value.trim();
			}
		}

		return null;
	}
}