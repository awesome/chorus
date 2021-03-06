require 'tempfile'
require 'digest/md5'
require 'yaml'
require 'socket'
require_relative './database_integration_helper'

module JdbcIntegration
  extend DatabaseIntegrationHelper

  def self.versions_file_name
    'jdbc_integration_file_versions'
  end

  def self.host_identifier
    'JDBC_HOST'
  end

  def self.files_to_track
    %w(
      jdbc_integration.rb
      setup_jdbc_databases.sql.erb
    )
  end

  def self.hostname
    @@hostname ||= ENV[host_identifier]
  end

  def self.username
    account['db_username']
  end

  def self.password
    account['db_password']
  end

  def self.schema_name
    "test_#{Socket.gethostname.gsub('.', '_').slice(0,14)}_#{Rails.env}".slice(0,30)
  end

  def self.real_data_source
    JdbcDataSource.find_by_host(hostname)
  end

  def self.connection
    JdbcConnection.new(real_data_source, real_account, {})
  end

  def self.real_account
    real_data_source.owner_account
  end

  def self.real_schema
    real_data_source.schemas.find_by_name(schema_name)
  end

  def self.setup_test_schemas
    refresh_if_changed do
      puts "Importing jdbc fixtures into #{schema_name}"
      sql = ERB.new(File.read(Rails.root.join 'spec/support/database_integration/setup_jdbc_databases.sql.erb')).result(binding)
      puts 'Executing setup_jdbc_databases.sql'
      execute_sql(sql)
    end
  end

  def self.schema_exists?
    Sequel.connect(hostname, :user => username, :password => password, :logger => Rails.logger) do |dbc|
      dbc.fetch(%(SELECT databasename FROM dbc.databases WHERE databasename='#{schema_name}')).any? do |row|
        row[:databasename].strip == schema_name
      end
    end
  end

  def self.execute_sql(sql)
    Sequel.connect(hostname, :user => username, :password => password, :logger => Rails.logger) do |dbc|
      sql.split(';').each do |line|
        dbc.run(line) unless line.blank?
      end
    end
  end

  private

  def self.jdbc_config
    @@jdbc_config ||= find_jdbc_data_source hostname
  end

  def self.find_jdbc_data_source(name)
    config['data_sources']['jdbc'].find { |hash| hash['host'] == name }
  end

  def self.account
    jdbc_config['account'] || {}
  end
end