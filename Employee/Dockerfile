
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy all project files
COPY . .

# Build the Spring Boot jar
RUN mvn clean package -DskipTests



FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]